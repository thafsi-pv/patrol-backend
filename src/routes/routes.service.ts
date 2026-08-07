import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto, UpdateRouteDto } from './dto/route.dto';

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRouteDto) {
    return this.prisma.route.create({
      data: {
        name: dto.name,
        description: dto.description,
        checkpoints: {
          create: dto.checkpointIds.map((cpId, idx) => ({
            checkpointId: cpId,
            orderIndex: idx + 1,
          })),
        },
      },
      include: { checkpoints: { include: { checkpoint: true }, orderBy: { orderIndex: 'asc' } } },
    });
  }

  async findAll() {
    return this.prisma.route.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      include: {
        checkpoints: {
          include: { checkpoint: true },
          orderBy: { orderIndex: 'asc' },
        },
        _count: { select: { sessions: true } },
      },
    });
  }

  async findOne(id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: {
        checkpoints: {
          include: { checkpoint: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  async update(id: string, dto: UpdateRouteDto) {
    await this.findOne(id);

    if (dto.checkpointIds !== undefined) {
      // Replace all route checkpoints atomically
      await this.prisma.routeCheckpoint.deleteMany({ where: { routeId: id } });
      await this.prisma.routeCheckpoint.createMany({
        data: dto.checkpointIds.map((cpId, idx) => ({
          routeId: id,
          checkpointId: cpId,
          orderIndex: idx + 1,
        })),
      });
    }

    return this.prisma.route.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.active !== undefined && { active: dto.active }),
      },
      include: {
        checkpoints: { include: { checkpoint: true }, orderBy: { orderIndex: 'asc' } },
      },
    });
  }

  async deactivate(id: string) {
    await this.findOne(id);
    return this.prisma.route.update({ where: { id }, data: { active: false } });
  }
}
