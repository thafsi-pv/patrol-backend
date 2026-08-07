import { Injectable } from '@nestjs/common';
import { PatrolStatus } from '@prisma/client';
import { haversineDistance } from '../common/geo.util';
import { PrismaService } from '../prisma/prisma.service';
import { ScanDto } from './dto/scan.dto';
import { PatrolLogsFilterDto } from './dto/patrol-logs-filter.dto';

// Configurable thresholds
const MAX_SPEED_M_S = 40;   // 40 m/s ≈ 144 km/h — impossible travel threshold
const MIN_ACCURACY_M = 0.1; // below 0.1m is physically impossible from a phone
const MAX_ACCURACY_M = 100; // above 100m is too imprecise (WiFi/cell only, no GPS fix)
//
// NOTE ON MOBILE GPS:
// iOS Chrome (WKWebView) and Android Chrome typically return accuracy of 10–65m
// even when standing exactly at the checkpoint. This is normal — browsers do not
// get raw satellite GPS; they use Apple/Google location fusion (WiFi + cell + GPS).
// Setting MAX_ACCURACY_M lower than ~65m will false-flag all mobile iOS scans.

@Injectable()
export class PatrolService {
  constructor(private readonly prisma: PrismaService) {}

  async scan(dto: ScanDto, guardId: string) {
    // 1. Look up checkpoint by QR code
    const checkpoint = await this.prisma.checkpoint.findUnique({
      where: { qrCode: dto.qrCode },
    });

    if (!checkpoint) {
      // Unknown QR — still log it as a security event
      await this.prisma.patrolLog.create({
        data: {
          qrCode: dto.qrCode,
          guardId,
          scannedLatitude: dto.latitude,
          scannedLongitude: dto.longitude,
          gpsAccuracyMeters: dto.accuracy,
          distanceMeters: null,
          status: PatrolStatus.UNKNOWN_QR,
          deviceId: dto.deviceId,
        },
      });
      return {
        status: PatrolStatus.UNKNOWN_QR,
        distanceMeters: null,
        message: 'QR code not recognized. This attempt has been logged.',
      };
    }

    // 2. Compute Haversine distance
    const distanceMeters = haversineDistance(
      dto.latitude,
      dto.longitude,
      checkpoint.latitude,
      checkpoint.longitude,
    );

    let status: PatrolStatus =
      distanceMeters <= checkpoint.radiusMeters
        ? PatrolStatus.SUCCESS
        : PatrolStatus.OUT_OF_RANGE;

    // 3. Anomaly checks
    let flagReason: string | null = null;

    // 3a. Accuracy sanity check
    if (
      dto.accuracy === undefined ||
      dto.accuracy === null ||
      dto.accuracy === 0 ||
      dto.accuracy < MIN_ACCURACY_M ||
      dto.accuracy > MAX_ACCURACY_M
    ) {
      status = PatrolStatus.FLAGGED;
      flagReason = 'suspicious_accuracy';
    }

    // 3b. Impossible travel detection
    if (!flagReason) {
      const lastLog = await this.prisma.patrolLog.findFirst({
        where: {
          guardId,
          NOT: { status: PatrolStatus.UNKNOWN_QR },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (lastLog) {
        const prevDistance = haversineDistance(
          lastLog.scannedLatitude,
          lastLog.scannedLongitude,
          dto.latitude,
          dto.longitude,
        );
        const elapsedSeconds =
          (Date.now() - lastLog.createdAt.getTime()) / 1000;

        if (elapsedSeconds > 0) {
          const impliedSpeedMs = prevDistance / elapsedSeconds;
          if (impliedSpeedMs > MAX_SPEED_M_S) {
            status = PatrolStatus.FLAGGED;
            flagReason = 'impossible_travel';
          }
        }
      }
    }

    // 3c. Device binding check
    if (!flagReason && dto.deviceId) {
      const guard = await this.prisma.user.findUnique({
        where: { id: guardId },
        select: { deviceId: true },
      });

      if (guard?.deviceId && guard.deviceId !== dto.deviceId) {
        status = PatrolStatus.FLAGGED;
        flagReason = 'device_mismatch';
      }
    }

    // 4. Write log — always, regardless of outcome
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

    const underlyingResult =
      distanceMeters <= checkpoint.radiusMeters ? 'in-range' : 'out-of-range';

    return {
      status,
      distanceMeters: Math.round(distanceMeters * 10) / 10,
      radiusMeters: checkpoint.radiusMeters,
      checkpointName: checkpoint.name,
      flagReason,
      underlyingResult: status === PatrolStatus.FLAGGED ? underlyingResult : undefined,
      message:
        status === PatrolStatus.SUCCESS
          ? `Checkpoint "${checkpoint.name}" verified successfully.`
          : status === PatrolStatus.FLAGGED
            ? `Scan flagged for review (${flagReason}). Underlying result: ${underlyingResult}.`
            : `Out of range. You are ${Math.round(distanceMeters)}m away (allowed: ${checkpoint.radiusMeters}m).`,
    };
  }

  async findLogs(filters: PatrolLogsFilterDto) {
    const page = Number(filters.page) || 1;
    const limit = Math.min(Number(filters.limit) || 50, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.checkpointId) where.checkpointId = filters.checkpointId;
    if (filters.guardId) where.guardId = filters.guardId;
    if (filters.status) where.status = filters.status;
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = new Date(filters.from);
      if (filters.to) where.createdAt.lte = new Date(filters.to);
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

  async findOneLog(id: string) {
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

    const [totalCheckpoints, scansToday, flaggedToday, totalGuards] =
      await Promise.all([
        this.prisma.checkpoint.count({ where: { active: true } }),
        this.prisma.patrolLog.count({
          where: { createdAt: { gte: today } },
        }),
        this.prisma.patrolLog.count({
          where: { createdAt: { gte: today }, status: PatrolStatus.FLAGGED },
        }),
        this.prisma.user.count({ where: { role: 'GUARD' } }),
      ]);

    return { totalCheckpoints, scansToday, flaggedToday, totalGuards };
  }
}
