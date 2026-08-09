"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatrolService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const geo_util_1 = require("../common/geo.util");
const prisma_service_1 = require("../prisma/prisma.service");
const MAX_SPEED_M_S = 40;
const MIN_ACCURACY_M = 0.1;
const MAX_ACCURACY_M = 30;
let PatrolService = class PatrolService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async scan(dto, guardId) {
        const checkpoint = await this.prisma.checkpoint.findUnique({
            where: { qrCode: dto.qrCode },
        });
        if (!checkpoint) {
            await this.prisma.patrolLog.create({
                data: {
                    qrCode: dto.qrCode,
                    guardId,
                    scannedLatitude: dto.latitude,
                    scannedLongitude: dto.longitude,
                    gpsAccuracyMeters: dto.accuracy,
                    distanceMeters: null,
                    status: client_1.PatrolStatus.UNKNOWN_QR,
                    deviceId: dto.deviceId,
                },
            });
            return {
                status: client_1.PatrolStatus.UNKNOWN_QR,
                distanceMeters: null,
                message: 'QR code not recognized. This attempt has been logged.',
            };
        }
        const distanceMeters = (0, geo_util_1.haversineDistance)(dto.latitude, dto.longitude, checkpoint.latitude, checkpoint.longitude);
        let status = distanceMeters <= checkpoint.radiusMeters
            ? client_1.PatrolStatus.SUCCESS
            : client_1.PatrolStatus.OUT_OF_RANGE;
        let flagReason = null;
        if (dto.accuracy === undefined ||
            dto.accuracy === null ||
            dto.accuracy === 0 ||
            dto.accuracy < MIN_ACCURACY_M ||
            dto.accuracy > MAX_ACCURACY_M) {
            status = client_1.PatrolStatus.FLAGGED;
            flagReason = 'suspicious_accuracy';
        }
        if (!flagReason) {
            const lastLog = await this.prisma.patrolLog.findFirst({
                where: {
                    guardId,
                    NOT: { status: client_1.PatrolStatus.UNKNOWN_QR },
                },
                orderBy: { createdAt: 'desc' },
            });
            if (lastLog) {
                const prevDistance = (0, geo_util_1.haversineDistance)(lastLog.scannedLatitude, lastLog.scannedLongitude, dto.latitude, dto.longitude);
                const elapsedSeconds = (Date.now() - lastLog.createdAt.getTime()) / 1000;
                if (elapsedSeconds > 0) {
                    const impliedSpeedMs = prevDistance / elapsedSeconds;
                    if (impliedSpeedMs > MAX_SPEED_M_S) {
                        status = client_1.PatrolStatus.FLAGGED;
                        flagReason = 'impossible_travel';
                    }
                }
            }
        }
        if (!flagReason && dto.deviceId) {
            const guard = await this.prisma.user.findUnique({
                where: { id: guardId },
                select: { deviceId: true },
            });
            if (guard?.deviceId && guard.deviceId !== dto.deviceId) {
                status = client_1.PatrolStatus.FLAGGED;
                flagReason = 'device_mismatch';
            }
        }
        await this.prisma.patrolLog.create({
            data: {
                qrCode: dto.qrCode,
                checkpointId: checkpoint.id,
                guardId,
                scannedLatitude: dto.latitude,
                scannedLongitude: dto.longitude,
                gpsAccuracyMeters: dto.accuracy,
                distanceMeters,
                status,
                flagReason,
                deviceId: dto.deviceId,
            },
        });
        const underlyingResult = distanceMeters <= checkpoint.radiusMeters ? 'in-range' : 'out-of-range';
        return {
            status,
            distanceMeters: Math.round(distanceMeters * 10) / 10,
            radiusMeters: checkpoint.radiusMeters,
            checkpointName: checkpoint.name,
            flagReason,
            underlyingResult: status === client_1.PatrolStatus.FLAGGED ? underlyingResult : undefined,
            message: status === client_1.PatrolStatus.SUCCESS
                ? `Checkpoint "${checkpoint.name}" verified successfully.`
                : status === client_1.PatrolStatus.FLAGGED
                    ? `Scan flagged for review (${flagReason}). Underlying result: ${underlyingResult}.`
                    : `Out of range. You are ${Math.round(distanceMeters)}m away (allowed: ${checkpoint.radiusMeters}m).`,
        };
    }
    async findLogs(filters) {
        const page = Number(filters.page) || 1;
        const limit = Math.min(Number(filters.limit) || 50, 100);
        const skip = (page - 1) * limit;
        const where = {};
        if (filters.checkpointId)
            where.checkpointId = filters.checkpointId;
        if (filters.guardId)
            where.guardId = filters.guardId;
        if (filters.status)
            where.status = filters.status;
        if (filters.from || filters.to) {
            where.createdAt = {};
            if (filters.from)
                where.createdAt.gte = new Date(filters.from);
            if (filters.to)
                where.createdAt.lte = new Date(filters.to);
        }
        const [logs, total] = await Promise.all([
            this.prisma.patrolLog.findMany({
                where,
                include: {
                    checkpoint: { select: { id: true, name: true } },
                    guard: { select: { id: true, name: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.patrolLog.count({ where }),
        ]);
        return {
            data: logs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOneLog(id) {
        return this.prisma.patrolLog.findUniqueOrThrow({
            where: { id },
            include: {
                checkpoint: true,
                guard: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
    }
    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [totalCheckpoints, scansToday, flaggedToday, totalGuards] = await Promise.all([
            this.prisma.checkpoint.count({ where: { active: true } }),
            this.prisma.patrolLog.count({
                where: { createdAt: { gte: today } },
            }),
            this.prisma.patrolLog.count({
                where: { createdAt: { gte: today }, status: client_1.PatrolStatus.FLAGGED },
            }),
            this.prisma.user.count({ where: { role: 'GUARD' } }),
        ]);
        return { totalCheckpoints, scansToday, flaggedToday, totalGuards };
    }
};
exports.PatrolService = PatrolService;
exports.PatrolService = PatrolService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PatrolService);
//# sourceMappingURL=patrol.service.js.map