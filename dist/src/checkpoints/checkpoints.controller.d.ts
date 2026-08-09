import type { Response } from 'express';
import { CheckpointsService } from './checkpoints.service';
import { CreateCheckpointDto, UpdateCheckpointDto } from './dto/checkpoint.dto';
export declare class CheckpointsController {
    private readonly checkpointsService;
    constructor(checkpointsService: CheckpointsService);
    create(dto: CreateCheckpointDto, req: any): Promise<{
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
    getQrImage(id: string, res: Response): Promise<void>;
}
