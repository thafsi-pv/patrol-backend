import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, IncidentSeverity } from '@prisma/client';
import { StartPatrolDto, ScanCheckpointDto, FilterSessionsDto } from './dto/patrol-session.dto';
import { haversineDistance } from '../common/geo.util';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class PatrolSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  // ─── Start a new patrol session ───────────────────────────────────────────

  async start(dto: StartPatrolDto, guardId: string, ipAddress?: string) {
    // Check if guard already has an active session
    const existingActive = await this.prisma.patrolSession.findFirst({
      where: { guardId, status: 'IN_PROGRESS' },
      include: {
        route: { include: { checkpoints: { include: { checkpoint: true }, orderBy: { orderIndex: 'asc' } } } },
        guard: { select: { id: true, name: true, email: true } },
        sessionLogs: true,
      },
    });

    if (existingActive) {
      throw new BadRequestException('You already have an active patrol session in progress. Please stop/complete it before starting a new one.');
    }

    const route = await this.prisma.route.findUnique({
      where: { id: dto.routeId },
      include: {
        checkpoints: { include: { checkpoint: true }, orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!route) throw new NotFoundException('Route not found');

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
            action: AuditAction.PATROL_STARTED,
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

    return session;
  }

  // ─── Scan a checkpoint within an active session ────────────────────────────

  async scanCheckpoint(sessionId: string, dto: ScanCheckpointDto, guardId: string, ipAddress?: string) {
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

    if (!session) throw new NotFoundException('Patrol session not found');
    if (session.guardId !== guardId) throw new BadRequestException('Unauthorized for this session');
    if (session.status !== 'IN_PROGRESS') throw new BadRequestException('Session is not active');

    // Lookup checkpoint by QR code
    const checkpoint = await this.prisma.checkpoint.findUnique({ where: { qrCode: dto.qrCode } });
    if (!checkpoint) throw new BadRequestException('Unknown QR code');

    // Verify checkpoint belongs to this route
    const routeCheckpoint = session.route.checkpoints.find(rc => rc.checkpointId === checkpoint.id);
    if (!routeCheckpoint) throw new BadRequestException('Checkpoint does not belong to this route');

    // GPS distance check
    const distance = haversineDistance(dto.latitude, dto.longitude, checkpoint.latitude, checkpoint.longitude);
    const isWithinRadius = distance <= checkpoint.radiusMeters;

    const formatDistance = (meters: number) =>
      meters >= 1000 ? `${(meters / 1000).toFixed(2)} km` : `${Math.round(meters)}m`;

    // ─── OUT OF RANGE: log the attempt then block ──────────────────────────────
    if (!isWithinRadius) {
      const distStr = formatDistance(distance);
      const radiusStr = formatDistance(checkpoint.radiusMeters);
      await this.prisma.auditLog.create({
        data: {
          action: AuditAction.OUT_OF_RANGE_ATTEMPT,
          userId: guardId,
          sessionId,
          ipAddress,
          deviceId: dto.deviceId,
          details: `OUT-OF-RANGE scan attempt on "${checkpoint.name}" — Guard was ${distStr} away (allowed: ${radiusStr}). Scan was BLOCKED.`,
        },
      });

      throw new ForbiddenException(
        `You are ${distStr} away from "${checkpoint.name}". ` +
        `You must be within ${radiusStr} to submit this checkpoint. Move closer and try again.`,
      );
    }

    // ─── WITHIN RADIUS: create session log entry ───────────────────────────────
    const severity = (dto.severity as IncidentSeverity) ?? 'NORMAL';

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
                create: dto.images.map(img => ({ imageUrl: img.imageUrl, r2Key: img.r2Key })),
              },
            }
          : {}),
      },
      include: { checkpoint: true, images: true },
    });

    // Create audit entry for successful scan
    await this.prisma.auditLog.create({
      data: {
        action: AuditAction.QR_SCANNED,
        userId: guardId,
        sessionId,
        ipAddress,
        deviceId: dto.deviceId,
        details: `Scanned "${checkpoint.name}" — Distance: ${Math.round(distance)}m — VERIFIED`,
      },
    });

    // Update session completion counts
    const scannedIds = new Set([...session.sessionLogs.map(l => l.checkpointId), checkpoint.id]);
    const completedCount = scannedIds.size;
    const completionRate = parseFloat(((completedCount / session.totalCount) * 100).toFixed(1));

    await this.prisma.patrolSession.update({
      where: { id: sessionId },
      data: { completedCount, completionRate },
    });

    // Send WhatsApp alerts to admin if severity is ISSUE_FOUND or EMERGENCY
    if (severity === 'ISSUE_FOUND' || severity === 'EMERGENCY') {
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

          const imageUrls = dto.images?.map(img => img.imageUrl) || [];

          for (const admin of admins) {
            if (admin.mobileNumber) {
              await this.whatsappService.sendMessage(admin.mobileNumber, msg, imageUrls);
            }
          }
        }
      } catch (waErr) {
        // Log WhatsApp sending error but do not fail the request
        console.error('Error sending WhatsApp notifications:', waErr);
      }
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

  // ─── End patrol session ───────────────────────────────────────────────────

  async end(sessionId: string, guardId: string, ipAddress?: string) {
    const session = await this.prisma.patrolSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Patrol session not found');
    if (session.guardId !== guardId) throw new BadRequestException('Unauthorized for this session');
    if (session.status !== 'IN_PROGRESS') throw new BadRequestException('Session is already ended');

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
            action: AuditAction.PATROL_COMPLETED,
            userId: guardId,
            ipAddress,
            details: `Patrol completed. Duration: ${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s. Completion: ${completionRate}%`,
          },
        },
      },
      include: {
        route: { select: { id: true, name: true } },
        guard: { select: { id: true, name: true, email: true } },
        sessionLogs: {
          include: { checkpoint: true, images: true },
          orderBy: { scannedAt: 'asc' },
        },
      },
    });

    return updated;
  }

  async getMyActiveSession(guardId: string) {
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

  // ─── Get active sessions ──────────────────────────────────────────────────

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

  // ─── Dashboard stats ──────────────────────────────────────────────────────

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

  // ─── Filterable session history ────────────────────────────────────────────

  async findAll(query: FilterSessionsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.guardId) where.guardId = query.guardId;
    if (query.routeId) where.routeId = query.routeId;
    if (query.status) where.status = query.status;
    if (query.shift) where.shift = query.shift;
    if (query.from || query.to) {
      where.startTime = {};
      if (query.from) where.startTime.gte = new Date(query.from);
      if (query.to) where.startTime.lte = new Date(query.to);
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

  // ─── Single session detail ────────────────────────────────────────────────

  async findOne(id: string) {
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
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }
}
