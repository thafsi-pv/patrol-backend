import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import makeWASocket, {
  DisconnectReason,
  WASocket,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as qrcode from 'qrcode-terminal';
import { PrismaService } from '../prisma/prisma.service';
import { usePrismaAuthState } from './prisma-auth-state';

@Injectable()
export class WhatsAppService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppService.name);
  private sock: WASocket | null = null;
  private isConnected = false;
  private failedPermanently = false;
  private clearSessionFn: (() => Promise<void>) | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private retryCount = 0;

  async onModuleInit() {
    await this.connectToWhatsApp();
  }

  async onModuleDestroy() {
    this.sock?.end(undefined);
  }

  private async connectToWhatsApp() {
    try {
      const { state, saveCreds, clearSession } = await usePrismaAuthState(this.prisma);
      this.clearSessionFn = clearSession;

      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        defaultQueryTimeoutMs: undefined,
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.logger.log('Scan this WhatsApp QR code to link device:');
          qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
          this.isConnected = false;
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

          this.logger.warn(`WhatsApp connection closed (Status: ${statusCode}).`);

          // ── Permanent failures — stop immediately, no retry ──────────────
          if (
            statusCode === DisconnectReason.loggedOut ||          // 401: user logged out
            statusCode === DisconnectReason.connectionReplaced    // 440: another session kicked this one out
          ) {
            this.logger.error(
              statusCode === DisconnectReason.connectionReplaced
                ? 'WhatsApp session was replaced by another device. Stopping — please reconnect from the admin panel.'
                : 'WhatsApp was logged out. Clearing database session.'
            );
            this.retryCount = 0;
            this.failedPermanently = true;
            if (this.sock) {
              this.sock.end(undefined);
              this.sock = null;
            }
            if (this.clearSessionFn) {
              await this.clearSessionFn();
            }
            return;
          }

          // ── Transient failures — retry up to 3 times ─────────────────────
          this.retryCount++;
          if (this.retryCount > 3) {
            this.logger.error('WhatsApp failed to connect after 3 retries. Manual reconnect required.');
            this.retryCount = 0;
            this.failedPermanently = true;
            await this.logout(true); // wipe session but skip auto-reconnect
          } else {
            this.logger.log(`WhatsApp reconnection attempt ${this.retryCount}/3...`);
            this.connectToWhatsApp();
          }
        } else if (connection === 'open') {
          this.isConnected = true;
          this.retryCount = 0;
          this.failedPermanently = false;
          this.logger.log('WhatsApp connection successfully opened!');
        }
      });
    } catch (err) {
      this.logger.error('Failed to initialize Baileys WASocket', err);
    }
  }

  async getPairingCode(phoneNumber: string): Promise<string> {
    if (!this.sock) {
      throw new Error('WhatsApp socket is not initialized');
    }
    const cleanNum = phoneNumber.replace(/\D/g, '');
    if (!cleanNum) {
      throw new Error('Phone number must contain digits only');
    }
    this.logger.log(`Requesting WhatsApp pairing code for number: ${cleanNum}`);
    const code = await this.sock.requestPairingCode(cleanNum);
    return code;
  }

  async logout(skipReconnect = false): Promise<void> {
    if (this.sock) {
      try {
        await this.sock.logout();
      } catch (err) {
        this.logger.error('Error during Baileys socket logout', err);
      }
      this.sock.end(undefined);
      this.sock = null;
    }
    this.isConnected = false;

    // Delete session records from PostgreSQL database
    if (this.clearSessionFn) {
      try {
        await this.clearSessionFn();
        this.logger.log('WhatsApp session cleared from PostgreSQL DB.');
      } catch (err) {
        this.logger.error('Failed to delete session records from DB', err);
      }
    }

    if (!skipReconnect) {
      this.failedPermanently = false;
      await this.connectToWhatsApp();
    }
  }

  /** Called from the admin frontend "Reconnect" button after permanent failure. */
  async manualReconnect(): Promise<void> {
    this.failedPermanently = false;
    this.retryCount = 0;
    await this.connectToWhatsApp();
  }

  async sendMessage(to: string, text: string, mediaUrls?: string[]): Promise<void> {
    if (!this.sock || !this.isConnected) {
      this.logger.warn(`Cannot send WhatsApp message to ${to}. WhatsApp bot is not connected.`);
      return;
    }

    try {
      let cleanNum = to.replace(/\D/g, '');
      if (!cleanNum.endsWith('@s.whatsapp.net')) {
        cleanNum = `${cleanNum}@s.whatsapp.net`;
      }

      if (mediaUrls && mediaUrls.length > 0) {
        for (let i = 0; i < mediaUrls.length; i++) {
          const url = mediaUrls[i];
          const caption = i === 0 ? text : `Media (${i + 1}/${mediaUrls.length})`;
          const lowerUrl = url.toLowerCase();

          try {
            // Classify media type from Cloudinary URL or extension
            if (
              lowerUrl.includes('/video/upload/') ||
              lowerUrl.match(/\.(mp4|mov|avi|mkv|webm)(\?.*)?$/)
            ) {
              // Video attachment
              await this.sock.sendMessage(cleanNum, {
                video: { url },
                caption,
                mimetype: 'video/mp4',
              });
              this.logger.log(`WhatsApp video sent to ${cleanNum}: ${url}`);
            } else if (
              lowerUrl.match(/\.(mp3|wav|ogg|m4a|aac|opus)(\?.*)?$/)
            ) {
              // Audio / Voice note attachment
              await this.sock.sendMessage(cleanNum, {
                audio: { url },
                mimetype: lowerUrl.includes('.m4a') ? 'audio/mp4' : lowerUrl.includes('.ogg') ? 'audio/ogg' : 'audio/mp3',
                ptt: true, // Send as playable push-to-talk voice note in WhatsApp chat
              });
              // Send text caption as follow-up message for audio
              if (i === 0 && text) {
                await this.sock.sendMessage(cleanNum, { text: `🎙️ *Voice Note Attachment*\n\n${text}` });
              }
              this.logger.log(`WhatsApp audio note sent to ${cleanNum}: ${url}`);
            } else if (
              lowerUrl.includes('/image/upload/') ||
              lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|heic)(\?.*)?$/)
            ) {
              // Image attachment
              await this.sock.sendMessage(cleanNum, {
                image: { url },
                caption,
              });
              this.logger.log(`WhatsApp image sent to ${cleanNum}: ${url}`);
            } else {
              // General Document / File attachment (PDF, DOCX, etc.)
              const filename = url.split('/').pop()?.split('?')[0] || 'attachment';
              await this.sock.sendMessage(cleanNum, {
                document: { url },
                caption,
                fileName: filename,
                mimetype: 'application/octet-stream',
              });
              this.logger.log(`WhatsApp document sent to ${cleanNum}: ${url}`);
            }
          } catch (mediaErr) {
            this.logger.error(`Failed to send WhatsApp media to ${to}: ${url}`, mediaErr);
          }
        }
      } else {
        // No media — send plain text message
        await this.sock.sendMessage(cleanNum, { text });
        this.logger.log(`WhatsApp text message sent to ${cleanNum}`);
      }
    } catch (err) {
      this.logger.error(`Failed to send WhatsApp message to ${to}`, err);
    }
  }

  getConnectionStatus() {
    const me = this.sock?.authState?.creds?.me;
    // me.id is like "919876543210:0@s.whatsapp.net" — strip suffix to get readable number
    const rawId = me?.id ?? '';
    const phoneNumber = rawId.split(':')[0].split('@')[0] || null;
    const accountName = me?.name ?? null;

    return {
      connected: this.isConnected,
      registered: !!this.sock?.authState?.creds?.registered,
      failedPermanently: this.failedPermanently,
      phoneNumber,
      accountName,
    };
  }
}
