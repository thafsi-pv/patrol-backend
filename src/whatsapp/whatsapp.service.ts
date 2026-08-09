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

  constructor(private readonly config: ConfigService) {}

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

      this.sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.logger.log('Scan this WhatsApp QR code to link device:');
          qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
          this.isConnected = false;
          const shouldReconnect =
            (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          this.logger.warn(
            `WhatsApp connection closed due to ${lastDisconnect?.error}, reconnecting: ${shouldReconnect}`,
          );
          if (shouldReconnect) {
            this.connectToWhatsApp();
          }
        } else if (connection === 'open') {
          this.isConnected = true;
          this.logger.log('WhatsApp connection successfully opened!');
        }
      });
    } catch (err) {
      this.logger.error('Failed to initialize Baileys WASocket', err);
    }
  }

  async sendMessage(to: string, text: string): Promise<void> {
    if (!this.sock || !this.isConnected) {
      this.logger.warn(`Cannot send WhatsApp message to ${to}. WhatsApp bot is not connected.`);
      return;
    }

    try {
      let cleanNum = to.replace(/\D/g, '');
      if (!cleanNum.endsWith('@s.whatsapp.net')) {
        cleanNum = `${cleanNum}@s.whatsapp.net`;
      }

      await this.sock.sendMessage(cleanNum, { text });
      this.logger.log(`WhatsApp message sent to ${cleanNum}`);
    } catch (err) {
      this.logger.error(`Failed to send WhatsApp message to ${to}`, err);
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}
