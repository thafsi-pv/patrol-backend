import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: dto.role,
        mobileNumber: dto.mobileNumber,
        whatsappAlertEnabled: dto.whatsappAlertEnabled !== undefined ? dto.whatsappAlertEnabled : true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        deviceId: true,
        mobileNumber: true,
        whatsappAlertEnabled: true,
        createdAt: true,
      },
    });
    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        deviceId: true,
        mobileNumber: true,
        whatsappAlertEnabled: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleWhatsappAlert(userId: string, enabled: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { whatsappAlertEnabled: enabled },
      select: {
        id: true,
        email: true,
        whatsappAlertEnabled: true,
      },
    });
  }
}
