import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/incident.dto';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  async create(dto: CreateIncidentDto, guardId: string) {
    const incident = await this.prisma.incident.create({
      data: {
        title: dto.title,
        description: dto.description,
        checkpointId: dto.checkpointId || null,
        patrolLogId: dto.patrolLogId || null,
        guardId,
        images: dto.images && dto.images.length > 0 ? {
          create: dto.images.map((img) => ({
            imageUrl: img.imageUrl,
            r2Key: img.r2Key,
            mediaType: img.mediaType ? img.mediaType.toUpperCase() : 'IMAGE',
          })),
        } : undefined,
      },
      include: {
        images: true,
        guard: {
          select: { id: true, name: true, email: true },
        },
        checkpoint: {
          select: { id: true, name: true },
        },
      },
    });

    // Notify admins via WhatsApp asynchronously in background
    setImmediate(async () => {
      try {
        const admins = await this.prisma.user.findMany({
          where: { role: 'ADMIN', mobileNumber: { not: null }, whatsappAlertEnabled: true },
        });

        if (admins.length > 0) {
          const timeStr = new Date(incident.createdAt).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'medium',
          });

          const msg =
            `🚨 *INCIDENT REPORTED*\n\n` +
            `*Title:* ${incident.title}\n` +
            `*Reporter:* ${incident.guard?.name || 'Unknown'}\n` +
            `*Location:* ${incident.checkpoint?.name || 'General (Not linked to checkpoint)'}\n` +
            `*Description:* ${incident.description}\n` +
            `*Time:* ${timeStr}`;

          const mediaItems = incident.images.map((img) => ({
            imageUrl: img.imageUrl,
            mediaType: img.mediaType,
          }));

          for (const admin of admins) {
            if (admin.mobileNumber) {
              await this.whatsappService.sendMessage(
                admin.mobileNumber,
                msg,
                mediaItems.length > 0 ? mediaItems : undefined,
              );
            }
          }
        }
      } catch (err) {
        console.error('Error sending WhatsApp incident notification:', err);
      }
    });

    return incident;
  }

  async findAll() {
    const [incidents, sessionLogIssues] = await Promise.all([
      this.prisma.incident.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          images: true,
          guard: {
            select: { id: true, name: true, email: true },
          },
          checkpoint: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.patrolSessionLog.findMany({
        where: {
          OR: [
            { severity: { in: ['ISSUE_FOUND', 'EMERGENCY'] } },
            { remarks: { not: null } },
            { images: { some: {} } },
          ],
        },
        orderBy: { scannedAt: 'desc' },
        include: {
          checkpoint: { select: { id: true, name: true } },
          images: true,
          session: {
            include: {
              guard: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
    ]);

    // Map session log issues that don't have a linked incident record already
    const existingPatrolSessionLogIds = new Set(
      incidents.map((i) => i.patrolSessionLogId).filter(Boolean),
    );

    const convertedSessionIssues = sessionLogIssues
      .filter((log) => !existingPatrolSessionLogIds.has(log.id))
      .map((log) => {
        const severityTitle =
          log.severity === 'EMERGENCY'
            ? `🚨 EMERGENCY: ${log.checkpoint?.name || 'Checkpoint'}`
            : log.severity === 'ISSUE_FOUND'
            ? `⚠️ ISSUE FOUND: ${log.checkpoint?.name || 'Checkpoint'}`
            : `Remark at ${log.checkpoint?.name || 'Checkpoint'}`;

        return {
          id: `log-${log.id}`,
          title: severityTitle,
          description: log.remarks || `Reported during patrol scan at ${log.checkpoint?.name || 'checkpoint'}`,
          checkpointId: log.checkpointId,
          patrolSessionLogId: log.id,
          createdAt: log.scannedAt,
          guard: log.session?.guard || { id: 'unknown', name: 'Guard', email: '' },
          checkpoint: log.checkpoint || undefined,
          images: log.images || [],
        };
      });

    // Combine and sort by createdAt descending
    return [...incidents, ...convertedSessionIssues].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async findOne(id: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      include: {
        images: true,
        guard: {
          select: { id: true, name: true, email: true },
        },
        checkpoint: {
          select: { id: true, name: true },
        },
      },
    });
    if (!incident) throw new NotFoundException('Incident report not found');
    return incident;
  }
}
