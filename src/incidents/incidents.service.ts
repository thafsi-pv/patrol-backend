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
        images: {
          create: dto.images.map((img) => ({
            imageUrl: img.imageUrl,
            r2Key: img.r2Key,
          })),
        },
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

          const imageUrls = incident.images.map((img) => img.imageUrl);

          for (const admin of admins) {
            if (admin.mobileNumber) {
              await this.whatsappService.sendMessage(
                admin.mobileNumber,
                msg,
                imageUrls.length > 0 ? imageUrls : undefined,
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
    return this.prisma.incident.findMany({
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
    });
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
