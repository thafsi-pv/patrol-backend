"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WhatsAppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const qrcode = __importStar(require("qrcode-terminal"));
const path = __importStar(require("path"));
let WhatsAppService = WhatsAppService_1 = class WhatsAppService {
    config;
    logger = new common_1.Logger(WhatsAppService_1.name);
    sock = null;
    isConnected = false;
    failedPermanently = false;
    constructor(config) {
        this.config = config;
    }
    retryCount = 0;
    async onModuleInit() {
        await this.connectToWhatsApp();
    }
    async onModuleDestroy() {
        this.sock?.end(undefined);
    }
    async connectToWhatsApp() {
        const sessionDir = this.config.get('WA_SESSION_DIR') || './wa-session';
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(path.resolve(sessionDir));
        try {
            this.sock = (0, baileys_1.default)({
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
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    const shouldReconnect = statusCode !== baileys_1.DisconnectReason.loggedOut;
                    this.logger.warn(`WhatsApp connection closed (Status: ${statusCode}). Reconnecting: ${shouldReconnect}`);
                    if (shouldReconnect) {
                        this.retryCount++;
                        if (this.retryCount > 3) {
                            this.logger.error('WhatsApp failed to connect after 3 retries. Wiping session — manual reconnect required.');
                            this.retryCount = 0;
                            this.failedPermanently = true;
                            await this.logout(true);
                        }
                        else {
                            this.logger.log(`WhatsApp reconnection attempt ${this.retryCount}/3...`);
                            this.connectToWhatsApp();
                        }
                    }
                }
                else if (connection === 'open') {
                    this.isConnected = true;
                    this.retryCount = 0;
                    this.logger.log('WhatsApp connection successfully opened!');
                }
            });
        }
        catch (err) {
            this.logger.error('Failed to initialize Baileys WASocket', err);
        }
    }
    async getPairingCode(phoneNumber) {
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
    async logout(skipReconnect = false) {
        if (this.sock) {
            try {
                await this.sock.logout();
            }
            catch (err) {
                this.logger.error('Error during Baileys socket logout', err);
            }
            this.sock.end(undefined);
            this.sock = null;
        }
        this.isConnected = false;
        const fs = require('fs');
        const sessionDir = this.config.get('WA_SESSION_DIR') || './wa-session';
        const resolvedPath = path.resolve(sessionDir);
        if (fs.existsSync(resolvedPath)) {
            try {
                fs.rmSync(resolvedPath, { recursive: true, force: true });
                this.logger.log('WhatsApp session state folder cleared.');
            }
            catch (err) {
                this.logger.error('Failed to delete session state folder', err);
            }
        }
        if (!skipReconnect) {
            this.failedPermanently = false;
            await this.connectToWhatsApp();
        }
    }
    async manualReconnect() {
        this.failedPermanently = false;
        this.retryCount = 0;
        await this.connectToWhatsApp();
    }
    async sendMessage(to, text, imageUrls) {
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
            this.logger.log(`WhatsApp text message sent to ${cleanNum}`);
            if (imageUrls && imageUrls.length > 0) {
                for (const url of imageUrls) {
                    try {
                        await this.sock.sendMessage(cleanNum, {
                            image: { url },
                            caption: 'Incident Evidence Photo',
                        });
                        this.logger.log(`WhatsApp image sent to ${cleanNum}: ${url}`);
                    }
                    catch (imgErr) {
                        this.logger.error(`Failed to send WhatsApp image attachment to ${to}: ${url}`, imgErr);
                    }
                }
            }
        }
        catch (err) {
            this.logger.error(`Failed to send WhatsApp message to ${to}`, err);
        }
    }
    getConnectionStatus() {
        const me = this.sock?.authState?.creds?.me;
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
};
exports.WhatsAppService = WhatsAppService;
exports.WhatsAppService = WhatsAppService = WhatsAppService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WhatsAppService);
//# sourceMappingURL=whatsapp.service.js.map