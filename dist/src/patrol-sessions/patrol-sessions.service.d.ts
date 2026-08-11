import { PrismaService } from '../prisma/prisma.service';
import { StartPatrolDto, ScanCheckpointDto, FilterSessionsDto } from './dto/patrol-session.dto';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
export declare class PatrolSessionsService {
    private readonly prisma;
    private readonly whatsappService;
    constructor(prisma: PrismaService, whatsappService: WhatsAppService);
    start(dto: StartPatrolDto, guardId: string, ipAddress?: string): Promise<{
        sessionLogs: {
            id: string;
            checkpointId: string;
            scannedLatitude: number;
            scannedLongitude: number;
            gpsAccuracyMeters: number | null;
            distanceMeters: number | null;
            sessionId: string;
            scannedAt: Date;
            isVerified: boolean;
            severity: import("@prisma/client").$Enums.IncidentSeverity;
            remarks: string | null;
        }[];
        route: {
            checkpoints: ({
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
                };
            } & {
                id: string;
                orderIndex: number;
                checkpointId: string;
                routeId: string;
            })[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            description: string | null;
            active: boolean;
        };
        guard: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        guardId: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        shift: string | null;
        routeId: string;
        startTime: Date;
        endTime: Date | null;
        durationSeconds: number | null;
        completedCount: number;
        totalCount: number;
        completionRate: number;
    }>;
    scanCheckpoint(sessionId: string, dto: ScanCheckpointDto, guardId: string, ipAddress?: string): Promise<{
        sessionLog: {
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
            };
            images: {
                id: string;
                createdAt: Date;
                patrolSessionLogId: string | null;
                imageUrl: string;
                r2Key: string;
                mediaType: string;
                incidentId: string | null;
            }[];
        } & {
            id: string;
            checkpointId: string;
            scannedLatitude: number;
            scannedLongitude: number;
            gpsAccuracyMeters: number | null;
            distanceMeters: number | null;
            sessionId: string;
            scannedAt: Date;
            isVerified: boolean;
            severity: import("@prisma/client").$Enums.IncidentSeverity;
            remarks: string | null;
        };
        isVerified: boolean;
        distanceMeters: number;
        completedCount: number;
        totalCount: number;
        completionRate: number;
        severity: import("@prisma/client").$Enums.IncidentSeverity;
    }>;
    end(sessionId: string, guardId: string, ipAddress?: string): Promise<{
        sessionLogs: ({
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
            };
            images: {
                id: string;
                createdAt: Date;
                patrolSessionLogId: string | null;
                imageUrl: string;
                r2Key: string;
                mediaType: string;
                incidentId: string | null;
            }[];
        } & {
            id: string;
            checkpointId: string;
            scannedLatitude: number;
            scannedLongitude: number;
            gpsAccuracyMeters: number | null;
            distanceMeters: number | null;
            sessionId: string;
            scannedAt: Date;
            isVerified: boolean;
            severity: import("@prisma/client").$Enums.IncidentSeverity;
            remarks: string | null;
        })[];
        route: {
            checkpoints: ({
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
                };
            } & {
                id: string;
                orderIndex: number;
                checkpointId: string;
                routeId: string;
            })[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            description: string | null;
            active: boolean;
        };
        guard: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        guardId: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        shift: string | null;
        routeId: string;
        startTime: Date;
        endTime: Date | null;
        durationSeconds: number | null;
        completedCount: number;
        totalCount: number;
        completionRate: number;
    }>;
    getMyActiveSession(guardId: string): Promise<({
        sessionLogs: ({
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
            };
            images: {
                id: string;
                createdAt: Date;
                patrolSessionLogId: string | null;
                imageUrl: string;
                r2Key: string;
                mediaType: string;
                incidentId: string | null;
            }[];
        } & {
            id: string;
            checkpointId: string;
            scannedLatitude: number;
            scannedLongitude: number;
            gpsAccuracyMeters: number | null;
            distanceMeters: number | null;
            sessionId: string;
            scannedAt: Date;
            isVerified: boolean;
            severity: import("@prisma/client").$Enums.IncidentSeverity;
            remarks: string | null;
        })[];
        route: {
            checkpoints: ({
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
                };
            } & {
                id: string;
                orderIndex: number;
                checkpointId: string;
                routeId: string;
            })[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            description: string | null;
            active: boolean;
        };
        guard: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        guardId: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        shift: string | null;
        routeId: string;
        startTime: Date;
        endTime: Date | null;
        durationSeconds: number | null;
        completedCount: number;
        totalCount: number;
        completionRate: number;
    }) | null>;
    getActiveSessions(): Promise<({
        sessionLogs: ({
            checkpoint: {
                id: string;
                name: string;
                latitude: number;
                longitude: number;
            };
            images: {
                id: string;
                createdAt: Date;
                patrolSessionLogId: string | null;
                imageUrl: string;
                r2Key: string;
                mediaType: string;
                incidentId: string | null;
            }[];
        } & {
            id: string;
            checkpointId: string;
            scannedLatitude: number;
            scannedLongitude: number;
            gpsAccuracyMeters: number | null;
            distanceMeters: number | null;
            sessionId: string;
            scannedAt: Date;
            isVerified: boolean;
            severity: import("@prisma/client").$Enums.IncidentSeverity;
            remarks: string | null;
        })[];
        route: {
            id: string;
            name: string;
        };
        guard: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        guardId: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        shift: string | null;
        routeId: string;
        startTime: Date;
        endTime: Date | null;
        durationSeconds: number | null;
        completedCount: number;
        totalCount: number;
        completionRate: number;
    })[]>;
    getStats(): Promise<{
        active: number;
        completedToday: number;
        totalToday: number;
        emergencies: number;
    }>;
    findAll(query: FilterSessionsDto): Promise<{
        data: ({
            sessionLogs: ({
                checkpoint: {
                    id: string;
                    name: string;
                };
                images: {
                    id: string;
                    createdAt: Date;
                    patrolSessionLogId: string | null;
                    imageUrl: string;
                    r2Key: string;
                    mediaType: string;
                    incidentId: string | null;
                }[];
            } & {
                id: string;
                checkpointId: string;
                scannedLatitude: number;
                scannedLongitude: number;
                gpsAccuracyMeters: number | null;
                distanceMeters: number | null;
                sessionId: string;
                scannedAt: Date;
                isVerified: boolean;
                severity: import("@prisma/client").$Enums.IncidentSeverity;
                remarks: string | null;
            })[];
            route: {
                checkpoints: ({
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
                    };
                } & {
                    id: string;
                    orderIndex: number;
                    checkpointId: string;
                    routeId: string;
                })[];
            } & {
                id: string;
                name: string;
                createdAt: Date;
                description: string | null;
                active: boolean;
            };
            guard: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            guardId: string;
            status: import("@prisma/client").$Enums.SessionStatus;
            shift: string | null;
            routeId: string;
            startTime: Date;
            endTime: Date | null;
            durationSeconds: number | null;
            completedCount: number;
            totalCount: number;
            completionRate: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<{
        auditLogs: {
            id: string;
            deviceId: string | null;
            createdAt: Date;
            sessionId: string | null;
            action: import("@prisma/client").$Enums.AuditAction;
            details: string | null;
            ipAddress: string | null;
            userId: string;
        }[];
        sessionLogs: ({
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
            };
            images: {
                id: string;
                createdAt: Date;
                patrolSessionLogId: string | null;
                imageUrl: string;
                r2Key: string;
                mediaType: string;
                incidentId: string | null;
            }[];
        } & {
            id: string;
            checkpointId: string;
            scannedLatitude: number;
            scannedLongitude: number;
            gpsAccuracyMeters: number | null;
            distanceMeters: number | null;
            sessionId: string;
            scannedAt: Date;
            isVerified: boolean;
            severity: import("@prisma/client").$Enums.IncidentSeverity;
            remarks: string | null;
        })[];
        route: {
            checkpoints: ({
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
                };
            } & {
                id: string;
                orderIndex: number;
                checkpointId: string;
                routeId: string;
            })[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            description: string | null;
            active: boolean;
        };
        guard: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        guardId: string;
        status: import("@prisma/client").$Enums.SessionStatus;
        shift: string | null;
        routeId: string;
        startTime: Date;
        endTime: Date | null;
        durationSeconds: number | null;
        completedCount: number;
        totalCount: number;
        completionRate: number;
    }>;
}
