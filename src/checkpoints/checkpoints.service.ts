import { Injectable, NotFoundException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckpointDto, UpdateCheckpointDto } from './dto/checkpoint.dto';

@Injectable()
export class CheckpointsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCheckpointDto, userId: string) {
    const qrCode = uuidv4(); // unique token encoded in QR image
    return this.prisma.checkpoint.create({
      data: {
        ...dto,
        qrCode,
        createdById: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.checkpoint.findMany({
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: { select: { patrolLogs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const checkpoint = await this.prisma.checkpoint.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    if (!checkpoint) throw new NotFoundException('Checkpoint not found');
    return checkpoint;
  }

  async update(id: string, dto: UpdateCheckpointDto) {
    await this.findOne(id); // throws if not found
    return this.prisma.checkpoint.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.checkpoint.delete({ where: { id } });
  }

  async getQrImage(id: string): Promise<Buffer> {
    const checkpoint = await this.findOne(id);
    const buffer = await QRCode.toBuffer(checkpoint.qrCode, {
      type: 'png',
      width: 512,
      margin: 2,
      errorCorrectionLevel: 'H',
    });
    return buffer;
  }
}
