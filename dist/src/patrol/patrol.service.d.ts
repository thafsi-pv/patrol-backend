import { PrismaService } from '../prisma/prisma.service';
import { ScanDto } from './dto/scan.dto';
import { PatrolLogsFilterDto } from './dto/patrol-logs-filter.dto';
export declare class PatrolService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    scan(dto: ScanDto, guardId: string): Promise<{
        status: "UNKNOWN_QR";
        distanceMeters: null;
        message: string;
        radiusMeters?: undefined;
        checkpointName?: undefined;
        flagReason?: undefined;
        underlyingResult?: undefined;
    } | {
        status: "SUCCESS" | "OUT_OF_RANGE" | "FLAGGED";
        distanceMeters: number;
        radiusMeters: number;
        checkpointName: string;
        flagReason: string | null;
        underlyingResult: string | undefined;
        message: string;
    }>;
    findLogs(filters: PatrolLogsFilterDto): Promise<{
        data: ({
            checkpoint: {
                id: string;
                name: string;
            } | null;
            guard: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            deviceId: string | null;
            createdAt: Date;
            qrCode: string;
            checkpointId: string | null;
            guardId: string;
            status: import("@prisma/client").$Enums.PatrolStatus;
            scannedLatitude: number;
            scannedLongitude: number;
            gpsAccuracyMeters: number | null;
            distanceMeters: number | null;
            flagReason: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOneLog(id: string): Promise<{
        checkpoint: {
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
        } | null;
        guard: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        deviceId: string | null;
        createdAt: Date;
        qrCode: string;
        checkpointId: string | null;
        guardId: string;
        status: import("@prisma/client").$Enums.PatrolStatus;
        scannedLatitude: number;
        scannedLongitude: number;
        gpsAccuracyMeters: number | null;
        distanceMeters: number | null;
        flagReason: string | null;
    }>;
    getDashboardStats(): Promise<{
        totalCheckpoints: number;
        scansToday: number;
        flaggedToday: number;
        totalGuards: number;
    }>;
}
