import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            deviceId: string | null;
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
            mobileNumber: string | null;
            createdAt: Date;
        };
    }>;
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        deviceId: string | null;
        createdAt: Date;
    }>;
}
