import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class WhatsAppService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly logger;
    private sock;
    private isConnected;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private connectToWhatsApp;
    getPairingCode(phoneNumber: string): Promise<string>;
    logout(): Promise<void>;
    sendMessage(to: string, text: string): Promise<void>;
    getConnectionStatus(): {
        connected: boolean;
        registered: boolean;
    };
}
