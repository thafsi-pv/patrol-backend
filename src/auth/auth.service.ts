import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update deviceId on first login or if a new device is presented
    if (dto.deviceId && user.deviceId !== dto.deviceId) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { deviceId: dto.deviceId },
      });
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const secret = this.config.get<string>('JWT_SECRET') ?? 'fallback-secret';
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN') ?? '8h';

    const accessToken = this.jwt.sign(payload, {
      secret,
      expiresIn: expiresIn as any,
    });

    const { passwordHash: _ph, ...safeUser } = user;
    return {
      accessToken,
      user: { ...safeUser, deviceId: dto.deviceId ?? user.deviceId },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        deviceId: true,
        createdAt: true,
      },
    });
    return user;
  }
}
