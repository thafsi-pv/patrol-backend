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
exports.PatrolSessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const geo_util_1 = require("../common/geo.util");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
let PatrolSessionsService = class PatrolSessionsService {
    prisma;
    whatsappService;
    constructor(prisma, whatsappService) {
        this.prisma = prisma;
        this.whatsappService = whatsappService;
    }
    async start(dto, guardId, ipAddress) {
        const existingActive = await this.prisma.patrolSession.findFirst({
            where: { guardId, status: 'IN_PROGRESS' },
            include: {
                route: { include: { checkpoints: { include: { checkpoint: true }, orderBy: { orderIndex: 'asc' } } } },
                guard: { select: { id: true, name: true, email: true } },
                sessionLogs: true,
            },
        });
        if (existingActive) {
            throw new common_1.BadRequestException('You already have an active patrol session in progress. Please stop/complete it before starting a new one.');
        }
        const route = await this.prisma.route.findUnique({
            where: { id: dto.routeId },
            include: {
                checkpoints: { include: { checkpoint: true }, orderBy: { orderIndex: 'asc' } },
            },
        });
        if (!route)
            throw new common_1.NotFoundException('Route not found');
        const totalCount = route.checkpoints.length;
        const session = await this.prisma.patrolSession.create({
            data: {
                routeId: dto.routeId,
                guardId,
                totalCount,
                shift: dto.shift,
                status: 'IN_PROGRESS',
                auditLogs: {
                    create: {
                        action: client_1.AuditAction.PATROL_STARTED,
                        userId: guardId,
                        ipAddress,
                        deviceId: dto.deviceId,
                        details: `Patrol started on route: ${route.name}`,
                    },
                },
            },
            include: {
                route: { include: { checkpoints: { include: { checkpoint: true }, orderBy: { orderIndex: 'asc' } } } },
                guard: { select: { id: true, name: true, email: true } },
                sessionLogs: true,
            },
        });
        setImmediate(async () => {
            try {
                const admins = await this.prisma.user.findMany({
                    where: { role: 'ADMIN', mobileNumber: { not: null }, whatsappAlertEnabled: true },
                });
                if (admins.length > 0) {
                    const startTimeStr = new Date(session.startTime).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'medium',
                    });
                    const msg = `🚀 *PATROL STARTED*\n\n` +
                        `*Guard:* ${session.guard?.name || 'Unknown'}\n` +
                        `*Route:* ${session.route?.name || 'Unknown'}\n` +
                        `*Start Time:* ${startTimeStr}\n` +
                        `*Shift:* ${session.shift || 'N/A'}\n` +
                        `*Total Checkpoints:* ${totalCount}`;
                    for (const admin of admins) {
                        if (admin.mobileNumber) {
                            await this.whatsappService.sendMessage(admin.mobileNumber, msg);
                        }
                    }
                }
            }
            catch (err) {
                console.error('Error sending WhatsApp patrol start notification:', err);
            }
        });
        return session;
    }
    async scanCheckpoint(sessionId, dto, guardId, ipAddress) {
        const session = await this.prisma.patrolSession.findUnique({
            where: { id: sessionId },
            include: {
                route: {
                    include: {
                        checkpoints: { include: { checkpoint: true }, orderBy: { orderIndex: 'asc' } },
                    },
                },
                sessionLogs: { select: { checkpointId: true } },
            },
        });
        if (!session)
            throw new common_1.NotFoundException('Patrol session not found');
        if (session.guardId !== guardId)
            throw new common_1.BadRequestException('Unauthorized for this session');
        if (session.status !== 'IN_PROGRESS')
            throw new common_1.BadRequestException('Session is not active');
        const checkpoint = await this.prisma.checkpoint.findUnique({ where: { qrCode: dto.qrCode } });
        if (!checkpoint)
            throw new common_1.BadRequestException('Unknown QR code');
        const routeCheckpoint = session.route.checkpoints.find(rc => rc.checkpointId === checkpoint.id);
        if (!routeCheckpoint)
            throw new common_1.BadRequestException('Checkpoint does not belong to this route');
        const distance = (0, geo_util_1.haversineDistance)(dto.latitude, dto.longitude, checkpoint.latitude, checkpoint.longitude);
        const isWithinRadius = distance <= checkpoint.radiusMeters;
        const formatDistance = (meters) => meters >= 1000 ? `${(meters / 1000).toFixed(2)} km` : `${Math.round(meters)}m`;
        if (!isWithinRadius) {
            const distStr = formatDistance(distance);
            const radiusStr = formatDistance(checkpoint.radiusMeters);
            await this.prisma.auditLog.create({
                data: {
                    action: client_1.AuditAction.OUT_OF_RANGE_ATTEMPT,
                    userId: guardId,
                    sessionId,
                    ipAddress,
                    deviceId: dto.deviceId,
                    details: `OUT-OF-RANGE scan attempt on "${checkpoint.name}" — Guard was ${distStr} away (allowed: ${radiusStr}). Scan was BLOCKED.`,
                },
            });
            throw new common_1.ForbiddenException(`You are ${distStr} away from "${checkpoint.name}". ` +
                `You must be within ${radiusStr} to submit this checkpoint. Move closer and try again.`);
        }
        const severity = dto.severity ?? 'NORMAL';
        const sessionLog = await this.prisma.patrolSessionLog.create({
            data: {
                sessionId,
                checkpointId: checkpoint.id,
                scannedLatitude: dto.latitude,
                scannedLongitude: dto.longitude,
                gpsAccuracyMeters: dto.accuracy,
                distanceMeters: distance,
                isVerified: true,
                severity,
                remarks: dto.remarks,
                ...(dto.images?.length
                    ? {
                        images: {
                            create: dto.images.map(img => ({
                                imageUrl: img.imageUrl,
                                r2Key: img.r2Key,
                                mediaType: img.mediaType ? img.mediaType.toUpperCase() : 'IMAGE',
                            })),
                        },
                    }
                    : {}),
            },
            include: { checkpoint: true, images: true },
        });
        if (severity !== 'NORMAL' || dto.remarks || (dto.images && dto.images.length > 0)) {
            try {
                const title = severity === 'EMERGENCY'
                    ? `🚨 EMERGENCY: ${checkpoint.name}`
                    : severity === 'ISSUE_FOUND'
                        ? `⚠️ ISSUE FOUND: ${checkpoint.name}`
                        : `Remark at Checkpoint: ${checkpoint.name}`;
                await this.prisma.incident.create({
                    data: {
                        title,
                        description: dto.remarks || `Issue reported during patrol scan at ${checkpoint.name}`,
                        checkpointId: checkpoint.id,
                        patrolSessionLogId: sessionLog.id,
                        guardId,
                        images: dto.images?.length
                            ? {
                                create: dto.images.map((img) => ({
                                    imageUrl: img.imageUrl,
                                    r2Key: img.r2Key,
                                    mediaType: img.mediaType ? img.mediaType.toUpperCase() : 'IMAGE',
                                })),
                            }
                            : undefined,
                    },
                });
            }
            catch (incErr) {
                console.error('Failed to create Incident record for session log:', incErr);
            }
        }
        await this.prisma.auditLog.create({
            data: {
                action: client_1.AuditAction.QR_SCANNED,
                userId: guardId,
                sessionId,
                ipAddress,
                deviceId: dto.deviceId,
                details: `Scanned "${checkpoint.name}" — Distance: ${Math.round(distance)}m — VERIFIED`,
            },
        });
        const scannedIds = new Set([...session.sessionLogs.map(l => l.checkpointId), checkpoint.id]);
        const completedCount = scannedIds.size;
        const completionRate = parseFloat(((completedCount / session.totalCount) * 100).toFixed(1));
        await this.prisma.patrolSession.update({
            where: { id: sessionId },
            data: { completedCount, completionRate },
        });
        if (severity === 'ISSUE_FOUND' || severity === 'EMERGENCY') {
            setImmediate(async () => {
                try {
                    const admins = await this.prisma.user.findMany({
                        where: { role: 'ADMIN', mobileNumber: { not: null }, whatsappAlertEnabled: true },
                    });
                    if (admins.length > 0) {
                        const guard = await this.prisma.user.findUnique({ where: { id: guardId } });
                        const severityEmoji = severity === 'EMERGENCY' ? '🚨 EMERGENCY' : '⚠️ ISSUE FOUND';
                        const msg = `*${severityEmoji} ALERT*\n\n` +
                            `*Guard:* ${guard?.name || 'Unknown'}\n` +
                            `*Route:* ${session.route?.name || 'Unknown'}\n` +
                            `*Checkpoint:* ${checkpoint.name}\n` +
                            `*Status:* ${severity.replace('_', ' ')}\n` +
                            `*Remarks:* ${dto.remarks || 'None'}\n` +
                            `*Time:* ${new Date().toLocaleString()}\n` +
                            `*Distance:* ${Math.round(distance)}m`;
                        const mediaItems = dto.images?.map(img => ({
                            imageUrl: img.imageUrl,
                            mediaType: img.mediaType,
                        })) || [];
                        for (const admin of admins) {
                            if (admin.mobileNumber) {
                                await this.whatsappService.sendMessage(admin.mobileNumber, msg, mediaItems);
                            }
                        }
                    }
                }
                catch (waErr) {
                    console.error('Error sending WhatsApp notifications in background:', waErr);
                }
            });
        }
        return {
            sessionLog,
            isVerified: true,
            distanceMeters: distance,
            completedCount,
            totalCount: session.totalCount,
            completionRate,
            severity,
        };
    }
    async end(sessionId, guardId, ipAddress) {
        const session = await this.prisma.patrolSession.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            throw new common_1.NotFoundException('Patrol session not found');
        if (session.guardId !== guardId)
            throw new common_1.BadRequestException('Unauthorized for this session');
        if (session.status !== 'IN_PROGRESS')
            throw new common_1.BadRequestException('Session is already ended');
        const endTime = new Date();
        const durationSeconds = Math.round((endTime.getTime() - session.startTime.getTime()) / 1000);
        const completionRate = parseFloat(((session.completedCount / session.totalCount) * 100).toFixed(1));
        const updated = await this.prisma.patrolSession.update({
            where: { id: sessionId },
            data: {
                endTime,
                durationSeconds,
                completionRate,
                status: 'COMPLETED',
                auditLogs: {
                    create: {
                        action: client_1.AuditAction.PATROL_COMPLETED,
                        userId: guardId,
                        ipAddress,
                        details: `Patrol completed. Duration: ${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s. Completion: ${completionRate}%`,
                    },
                },
            },
            include: {
                route: {
                    include: {
                        checkpoints: {
                            include: { checkpoint: true },
                            orderBy: { orderIndex: 'asc' },
                        },
                    },
                },
                guard: { select: { id: true, name: true, email: true } },
                sessionLogs: {
                    include: { checkpoint: true, images: true },
                    orderBy: { scannedAt: 'asc' },
                },
            },
        });
        setImmediate(async () => {
            try {
                const admins = await this.prisma.user.findMany({
                    where: { role: 'ADMIN', mobileNumber: { not: null }, whatsappAlertEnabled: true },
                });
                if (admins.length > 0) {
                    const startTimeStr = new Date(updated.startTime).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'medium',
                    });
                    const endTimeStr = updated.endTime
                        ? new Date(updated.endTime).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'medium',
                        })
                        : 'N/A';
                    const durationSec = updated.durationSeconds || 0;
                    const mins = Math.floor(durationSec / 60);
                    const secs = durationSec % 60;
                    const durationStr = `${mins}m ${secs}s`;
                    const scannedLogMap = new Map(updated.sessionLogs.map((log) => [log.checkpointId, log]));
                    const routeCheckpoints = updated.route?.checkpoints || [];
                    let checkpointBreakdown = '';
                    const issueSummary = [];
                    const allImageUrls = [];
                    routeCheckpoints.forEach((rc, index) => {
                        const cpName = rc.checkpoint.name;
                        const log = scannedLogMap.get(rc.checkpointId);
                        if (log) {
                            let statusIcon = '✅ Scanned';
                            if (log.severity === 'ISSUE_FOUND')
                                statusIcon = '⚠️ Issue Found';
                            if (log.severity === 'EMERGENCY')
                                statusIcon = '🚨 Emergency';
                            let logDetail = `${index + 1}. ${cpName} — ${statusIcon}`;
                            if (log.remarks) {
                                logDetail += ` (Remarks: ${log.remarks})`;
                            }
                            checkpointBreakdown += `${logDetail}\n`;
                            if (log.severity !== 'NORMAL' || log.remarks) {
                                issueSummary.push(`• *${cpName}* [${log.severity.replace('_', ' ')}]: ${log.remarks || 'No remarks'}`);
                            }
                            if (log.images && log.images.length > 0) {
                                log.images.forEach((img) => allImageUrls.push(img.imageUrl));
                            }
                        }
                        else {
                            checkpointBreakdown += `${index + 1}. ${cpName} — ❌ Missed\n`;
                        }
                    });
                    let msg = `🏁 *PATROL COMPLETED SUMMARY*\n\n` +
                        `*Guard:* ${updated.guard?.name || 'Unknown'}\n` +
                        `*Route:* ${updated.route?.name || 'Unknown'}\n` +
                        `*Start Time:* ${startTimeStr}\n` +
                        `*End Time:* ${endTimeStr}\n` +
                        `*Time Taken:* ${durationStr}\n` +
                        `*Progress:* ${updated.completedCount}/${updated.totalCount} (${updated.completionRate}%)\n\n` +
                        `📋 *Checkpoint Breakdown:*\n${checkpointBreakdown}`;
                    if (issueSummary.length > 0) {
                        msg += `\n⚠️ *Issues Details:*\n${issueSummary.join('\n')}`;
                    }
                    for (const admin of admins) {
                        if (admin.mobileNumber) {
                            await this.whatsappService.sendMessage(admin.mobileNumber, msg, allImageUrls.length > 0 ? allImageUrls : undefined);
                        }
                    }
                }
            }
            catch (err) {
                console.error('Error sending WhatsApp patrol completion notification:', err);
            }
        });
        return updated;
    }
    async getMyActiveSession(guardId) {
        return this.prisma.patrolSession.findFirst({
            where: { guardId, status: 'IN_PROGRESS' },
            include: {
                route: {
                    include: { checkpoints: { include: { checkpoint: true }, orderBy: { orderIndex: 'asc' } } },
                },
                guard: { select: { id: true, name: true, email: true } },
                sessionLogs: {
                    include: { checkpoint: true, images: true },
                    orderBy: { scannedAt: 'asc' },
                },
            },
        });
    }
    async getActiveSessions() {
        return this.prisma.patrolSession.findMany({
            where: { status: 'IN_PROGRESS' },
            include: {
                route: { select: { id: true, name: true } },
                guard: { select: { id: true, name: true, email: true } },
                sessionLogs: {
                    include: {
                        checkpoint: { select: { id: true, name: true, latitude: true, longitude: true } },
                        images: true,
                    },
                    orderBy: { scannedAt: 'desc' },
                },
            },
            orderBy: { startTime: 'desc' },
        });
    }
    async getStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [active, completedToday, totalToday, emergencies] = await Promise.all([
            this.prisma.patrolSession.count({ where: { status: 'IN_PROGRESS' } }),
            this.prisma.patrolSession.count({ where: { status: 'COMPLETED', startTime: { gte: today } } }),
            this.prisma.patrolSession.count({ where: { startTime: { gte: today } } }),
            this.prisma.patrolSessionLog.count({ where: { severity: 'EMERGENCY', scannedAt: { gte: today } } }),
        ]);
        return { active, completedToday, totalToday, emergencies };
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.guardId)
            where.guardId = query.guardId;
        if (query.routeId)
            where.routeId = query.routeId;
        if (query.status)
            where.status = query.status;
        if (query.shift)
            where.shift = query.shift;
        if (query.from || query.to) {
            where.startTime = {};
            if (query.from)
                where.startTime.gte = new Date(query.from);
            if (query.to)
                where.startTime.lte = new Date(query.to);
        }
        const [data, total] = await Promise.all([
            this.prisma.patrolSession.findMany({
                where,
                skip,
                take: limit,
                orderBy: { startTime: 'desc' },
                include: {
                    route: {
                        include: { checkpoints: { include: { checkpoint: true }, orderBy: { orderIndex: 'asc' } } },
                    },
                    guard: { select: { id: true, name: true, email: true } },
                    sessionLogs: {
                        include: {
                            checkpoint: { select: { id: true, name: true } },
                            images: true,
                        },
                        orderBy: { scannedAt: 'asc' },
                    },
                },
            }),
            this.prisma.patrolSession.count({ where }),
        ]);
        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }
    async findOne(id) {
        const session = await this.prisma.patrolSession.findUnique({
            where: { id },
            include: {
                route: {
                    include: { checkpoints: { include: { checkpoint: true }, orderBy: { orderIndex: 'asc' } } },
                },
                guard: { select: { id: true, name: true, email: true } },
                sessionLogs: {
                    include: { checkpoint: true, images: true },
                    orderBy: { scannedAt: 'asc' },
                },
                auditLogs: {
                    where: { action: 'OUT_OF_RANGE_ATTEMPT' },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        return session;
    }
};
exports.PatrolSessionsService = PatrolSessionsService;
exports.PatrolSessionsService = PatrolSessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsAppService])
], PatrolSessionsService);
//# sourceMappingURL=patrol-sessions.service.js.map