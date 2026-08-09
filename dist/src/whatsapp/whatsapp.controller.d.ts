import { WhatsAppService } from './whatsapp.service';
export declare class WhatsAppController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsAppService);
    getStatus(): {
        connected: boolean;
        registered: boolean;
    };
    getPairingCode(phoneNumber: string): Promise<{
        code: string;
    }>;
    logout(): Promise<{
        success: boolean;
    }>;
}
