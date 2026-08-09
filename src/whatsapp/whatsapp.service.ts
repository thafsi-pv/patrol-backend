import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as qrcode from 'qrcode-terminal';
import * as path from 'path';

@Injectable()
export class WhatsAppService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppService.name);
  private sock: WASocket | null = null;
  private isConnected = false;
  private failedPermanently = false;

  constructor(private readonly config: ConfigService) {}

  private retryCount = 0;

  async onModuleInit() {
    await this.connectToWhatsApp();
  }

  async onModuleDestroy() {
    this.sock?.end(undefined);
  }

  private async connectToWhatsApp() {
    const sessionDir = this.config.get<string>('WA_SESSION_DIR') || './wa-session';
    const { state, saveCreds } = await useMultiFileAuthState(path.resolve(sessionDir));

    try {
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
                : 'WhatsApp was logged out. Wiping session.'
            );
            this.retryCount = 0;
            this.failedPermanently = true;
            // End socket cleanly without triggering further connection.update events
            if (this.sock) {
              this.sock.end(undefined);
              this.sock = null;
            }
            // Wipe session files so a fresh link is required
            const fs = require('fs');
            const sessionDir = this.config.get<string>('WA_SESSION_DIR') || './wa-session';
            const resolvedPath = require('path').resolve(sessionDir);
            if (fs.existsSync(resolvedPath)) {
              fs.rmSync(resolvedPath, { recursive: true, force: true });
              this.logger.log('WhatsApp session folder cleared.');
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

    // Delete session files
    const fs = require('fs');
    const sessionDir = this.config.get<string>('WA_SESSION_DIR') || './wa-session';
    const resolvedPath = path.resolve(sessionDir);
    if (fs.existsSync(resolvedPath)) {
      try {
        fs.rmSync(resolvedPath, { recursive: true, force: true });
        this.logger.log('WhatsApp session state folder cleared.');
      } catch (err) {
        this.logger.error('Failed to delete session state folder', err);
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

  async sendMessage(to: string, text: string, imageUrls?: string[]): Promise<void> {
    if (!this.sock || !this.isConnected) {
      this.logger.warn(`Cannot send WhatsApp message to ${to}. WhatsApp bot is not connected.`);
      return;
    }

    try {
      let cleanNum = to.replace(/\D/g, '');
      if (!cleanNum.endsWith('@s.whatsapp.net')) {
        cleanNum = `${cleanNum}@s.whatsapp.net`;
      }

      // Send the text message
      await this.sock.sendMessage(cleanNum, { text });
      this.logger.log(`WhatsApp text message sent to ${cleanNum}`);

      // Send attached images if any
      if (imageUrls && imageUrls.length > 0) {
        for (const url of imageUrls) {
          try {
            await this.sock.sendMessage(cleanNum, {
              image: { url },
              caption: 'Incident Evidence Photo',
            });
            this.logger.log(`WhatsApp image sent to ${cleanNum}: ${url}`);
          } catch (imgErr) {
            this.logger.error(`Failed to send WhatsApp image attachment to ${to}: ${url}`, imgErr);
          }
        }
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
