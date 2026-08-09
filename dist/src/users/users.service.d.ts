import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        deviceId: string | null;
        mobileNumber: string | null;
        whatsappAlertEnabled: boolean;
        createdAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        deviceId: string | null;
        mobileNumber: string | null;
        whatsappAlertEnabled: boolean;
        createdAt: Date;
    }[]>;
    toggleWhatsappAlert(userId: string, enabled: boolean): Promise<{
        id: string;
        email: string;
        whatsappAlertEnabled: boolean;
    }>;
}
