import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    toggleWhatsappAlert(id: string, enabled: boolean): Promise<{
        id: string;
        email: string;
        whatsappAlertEnabled: boolean;
    }>;
}
