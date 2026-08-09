import { WhatsAppService } from './whatsapp.service';
export declare class WhatsAppController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsAppService);
    getStatus(): {
        connected: boolean;
        registered: boolean;
        failedPermanently: boolean;
        phoneNumber: string | null;
        accountName: string | null;
    };
    getPairingCode(phoneNumber: string): Promise<{
        code: string;
    }>;
    logout(): Promise<{
        success: boolean;
    }>;
    connect(): Promise<{
        success: boolean;
    }>;
}
