import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckpointDto, UpdateCheckpointDto } from './dto/checkpoint.dto';
export declare class CheckpointsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateCheckpointDto, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        qrCode: string;
        description: string | null;
        latitude: number;
        longitude: number;
        radiusMeters: number;
        active: boolean;
        createdById: string;
    }>;
    findAll(): Promise<({
        _count: {
            patrolLogs: number;
        };
        createdBy: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        qrCode: string;
        description: string | null;
        latitude: number;
        longitude: number;
        radiusMeters: number;
        active: boolean;
        createdById: string;
    })[]>;
    findOne(id: string): Promise<{
        createdBy: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        qrCode: string;
        description: string | null;
        latitude: number;
        longitude: number;
        radiusMeters: number;
        active: boolean;
        createdById: string;
    }>;
    update(id: string, dto: UpdateCheckpointDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        qrCode: string;
        description: string | null;
        latitude: number;
        longitude: number;
        radiusMeters: number;
        active: boolean;
        createdById: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        qrCode: string;
        description: string | null;
        latitude: number;
        longitude: number;
        radiusMeters: number;
        active: boolean;
        createdById: string;
    }>;
    getQrImage(id: string): Promise<Buffer>;
}
