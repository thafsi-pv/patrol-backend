import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class WhatsAppService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly logger;
    private sock;
    private isConnected;
    private failedPermanently;
    constructor(config: ConfigService);
    private retryCount;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private connectToWhatsApp;
    getPairingCode(phoneNumber: string): Promise<string>;
    logout(skipReconnect?: boolean): Promise<void>;
    manualReconnect(): Promise<void>;
    sendMessage(to: string, text: string, mediaUrls?: string[]): Promise<void>;
    getConnectionStatus(): {
        connected: boolean;
        registered: boolean;
        failedPermanently: boolean;
        phoneNumber: string | null;
        accountName: string | null;
    };
}
