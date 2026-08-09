import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            deviceId: string | null;
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
            mobileNumber: string | null;
            whatsappAlertEnabled: boolean;
            createdAt: Date;
        };
    }>;
    getMe(req: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        deviceId: string | null;
        createdAt: Date;
    }>;
}
