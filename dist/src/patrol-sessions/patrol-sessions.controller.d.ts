import { PatrolSessionsService } from './patrol-sessions.service';
import { StartPatrolDto, ScanCheckpointDto, FilterSessionsDto } from './dto/patrol-session.dto';
export declare class PatrolSessionsController {
    private readonly service;
    constructor(service: PatrolSessionsService);
    start(dto: StartPatrolDto, req: any): Promise<{
        sessionLogs: {
            id: string;
            checkpointId: string;
            scannedLatitude: number;
            scannedLongitude: number;
            gpsAccuracyMeters: number | null;
            distanceMeters: number | null;
            severity: import("@prisma/client").$Enums.IncidentSeverity;
            remarks: string | null;
            sessionId: string;
            scannedAt: Date;
            isVerified: boolean;
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
        routeId: string;
        shift: string | null;
        startTime: Date;
        endTime: Date | null;
        durationSeconds: number | null;
        completedCount: number;
        totalCount: number;
        completionRate: number;
    }>;
    scan(id: string, dto: ScanCheckpointDto, req: any): Promise<{
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
                incidentId: string | null;
            }[];
        } & {
            id: string;
            checkpointId: string;
            scannedLatitude: number;
            scannedLongitude: number;
            gpsAccuracyMeters: number | null;
            distanceMeters: number | null;
            severity: import("@prisma/client").$Enums.IncidentSeverity;
            remarks: string | null;
            sessionId: string;
            scannedAt: Date;
            isVerified: boolean;
        };
        isVerified: boolean;
        distanceMeters: number;
        completedCount: number;
        totalCount: number;
        completionRate: number;
        severity: import("@prisma/client").$Enums.IncidentSeverity;
    }>;
    end(id: string, req: any): Promise<{
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
                incidentId: string | null;
            }[];
        } & {
            id: string;
            checkpointId: string;
            scannedLatitude: number;
            scannedLongitude: number;
            gpsAccuracyMeters: number | null;
            distanceMeters: number | null;
            severity: import("@prisma/client").$Enums.IncidentSeverity;
            remarks: string | null;
            sessionId: string;
            scannedAt: Date;
            isVerified: boolean;
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
        routeId: string;
        shift: string | null;
        startTime: Date;
        endTime: Date | null;
        durationSeconds: number | null;
        completedCount: number;
        totalCount: number;
        completionRate: number;
    }>;
    getMyActive(req: any): Promise<({
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
                incidentId: string | null;
            }[];
        } & {
            id: string;
            checkpointId: string;
            scannedLatitude: number;
            scannedLongitude: number;
            gpsAccuracyMeters: number | null;
            distanceMeters: number | null;
            severity: import("@prisma/client").$Enums.IncidentSeverity;
            remarks: string | null;
            sessionId: string;
            scannedAt: Date;
            isVerified: boolean;
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
        routeId: string;
        shift: string | null;
        startTime: Date;
        endTime: Date | null;
        durationSeconds: number | null;
        completedCount: number;
        totalCount: number;
        completionRate: number;
    }) | null>;
    getActive(): Promise<({
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
                incidentId: string | null;
            }[];
        } & {
            id: string;
            checkpointId: string;
            scannedLatitude: number;
            scannedLongitude: number;
            gpsAccuracyMeters: number | null;
            distanceMeters: number | null;
            severity: import("@prisma/client").$Enums.IncidentSeverity;
            remarks: string | null;
            sessionId: string;
            scannedAt: Date;
            isVerified: boolean;
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
        routeId: string;
        shift: string | null;
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
                    incidentId: string | null;
                }[];
            } & {
                id: string;
                checkpointId: string;
                scannedLatitude: number;
                scannedLongitude: number;
                gpsAccuracyMeters: number | null;
                distanceMeters: number | null;
                severity: import("@prisma/client").$Enums.IncidentSeverity;
                remarks: string | null;
                sessionId: string;
                scannedAt: Date;
                isVerified: boolean;
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
            routeId: string;
            shift: string | null;
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
            action: import("@prisma/client").$Enums.AuditAction;
            details: string | null;
            ipAddress: string | null;
            userId: string;
            sessionId: string | null;
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
                incidentId: string | null;
            }[];
        } & {
            id: string;
            checkpointId: string;
            scannedLatitude: number;
            scannedLongitude: number;
            gpsAccuracyMeters: number | null;
            distanceMeters: number | null;
            severity: import("@prisma/client").$Enums.IncidentSeverity;
            remarks: string | null;
            sessionId: string;
            scannedAt: Date;
            isVerified: boolean;
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
        routeId: string;
        shift: string | null;
        startTime: Date;
        endTime: Date | null;
        durationSeconds: number | null;
        completedCount: number;
        totalCount: number;
        completionRate: number;
    }>;
}
