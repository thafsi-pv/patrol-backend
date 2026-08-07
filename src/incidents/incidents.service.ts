import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/incident.dto';

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateIncidentDto, guardId: string) {
    return this.prisma.incident.create({
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
