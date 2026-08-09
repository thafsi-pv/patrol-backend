import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Get('status')
  @Roles(Role.ADMIN)
  getStatus() {
    return this.whatsappService.getConnectionStatus();
  }

  @Post('pair')
  @Roles(Role.ADMIN)
  async getPairingCode(@Body('phoneNumber') phoneNumber: string) {
    const code = await this.whatsappService.getPairingCode(phoneNumber);
    return { code };
  }

  @Post('logout')
  @Roles(Role.ADMIN)
  async logout() {
    await this.whatsappService.logout();
    return { success: true };
  }
}
