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
const prisma_service_1 = require("../prisma/prisma.service");
const prisma_auth_state_1 = require("./prisma-auth-state");
let WhatsAppService = WhatsAppService_1 = class WhatsAppService {
    config;
    prisma;
    logger = new common_1.Logger(WhatsAppService_1.name);
    sock = null;
    isConnected = false;
    failedPermanently = false;
    clearSessionFn = null;
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
    }
    retryCount = 0;
    async onModuleInit() {
        await this.connectToWhatsApp();
    }
    async onModuleDestroy() {
        this.sock?.end(undefined);
    }
    async connectToWhatsApp() {
        try {
            const { state, saveCreds, clearSession } = await (0, prisma_auth_state_1.usePrismaAuthState)(this.prisma);
            this.clearSessionFn = clearSession;
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
                    this.logger.warn(`WhatsApp connection closed (Status: ${statusCode}).`);
                    if (statusCode === baileys_1.DisconnectReason.loggedOut ||
                        statusCode === baileys_1.DisconnectReason.connectionReplaced) {
                        this.logger.error(statusCode === baileys_1.DisconnectReason.connectionReplaced
                            ? 'WhatsApp session was replaced by another device. Stopping — please reconnect from the admin panel.'
                            : 'WhatsApp was logged out. Clearing database session.');
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
                    this.retryCount++;
                    if (this.retryCount > 3) {
                        this.logger.error('WhatsApp failed to connect after 3 retries. Manual reconnect required.');
                        this.retryCount = 0;
                        this.failedPermanently = true;
                        await this.logout(true);
                    }
                    else {
                        this.logger.log(`WhatsApp reconnection attempt ${this.retryCount}/3...`);
                        this.connectToWhatsApp();
                    }
                }
                else if (connection === 'open') {
                    this.isConnected = true;
                    this.retryCount = 0;
                    this.failedPermanently = false;
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
        if (this.clearSessionFn) {
            try {
                await this.clearSessionFn();
                this.logger.log('WhatsApp session cleared from PostgreSQL DB.');
            }
            catch (err) {
                this.logger.error('Failed to delete session records from DB', err);
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
    async sendMessage(to, text, mediaUrls) {
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
                        if (lowerUrl.includes('/video/upload/') ||
                            lowerUrl.match(/\.(mp4|mov|avi|mkv|webm)(\?.*)?$/)) {
                            await this.sock.sendMessage(cleanNum, {
                                video: { url },
                                caption,
                                mimetype: 'video/mp4',
                            });
                            this.logger.log(`WhatsApp video sent to ${cleanNum}: ${url}`);
                        }
                        else if (lowerUrl.match(/\.(mp3|wav|ogg|m4a|aac|opus)(\?.*)?$/)) {
                            await this.sock.sendMessage(cleanNum, {
                                audio: { url },
                                mimetype: lowerUrl.includes('.m4a') ? 'audio/mp4' : lowerUrl.includes('.ogg') ? 'audio/ogg' : 'audio/mp3',
                                ptt: true,
                            });
                            if (i === 0 && text) {
                                await this.sock.sendMessage(cleanNum, { text: `🎙️ *Voice Note Attachment*\n\n${text}` });
                            }
                            this.logger.log(`WhatsApp audio note sent to ${cleanNum}: ${url}`);
                        }
                        else if (lowerUrl.includes('/image/upload/') ||
                            lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|heic)(\?.*)?$/)) {
                            await this.sock.sendMessage(cleanNum, {
                                image: { url },
                                caption,
                            });
                            this.logger.log(`WhatsApp image sent to ${cleanNum}: ${url}`);
                        }
                        else {
                            const filename = url.split('/').pop()?.split('?')[0] || 'attachment';
                            await this.sock.sendMessage(cleanNum, {
                                document: { url },
                                caption,
                                fileName: filename,
                                mimetype: 'application/octet-stream',
                            });
                            this.logger.log(`WhatsApp document sent to ${cleanNum}: ${url}`);
                        }
                    }
                    catch (mediaErr) {
                        this.logger.error(`Failed to send WhatsApp media to ${to}: ${url}`, mediaErr);
                    }
                }
            }
            else {
                await this.sock.sendMessage(cleanNum, { text });
                this.logger.log(`WhatsApp text message sent to ${cleanNum}`);
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
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], WhatsAppService);
//# sourceMappingURL=whatsapp.service.js.map