import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PatrolSessionsService } from './patrol-sessions.service';
import { StartPatrolDto, ScanCheckpointDto, FilterSessionsDto } from './dto/patrol-session.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('patrol-sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatrolSessionsController {
  constructor(private readonly service: PatrolSessionsService) {}

  @Post('start')
  @Roles(Role.ADMIN, Role.GUARD)
  start(@Body() dto: StartPatrolDto, @Request() req: any) {
    const ip = req.ip || req.connection?.remoteAddress;
    return this.service.start(dto, req.user.id, ip);
  }

  @Post(':id/scan')
  @Roles(Role.ADMIN, Role.GUARD)
  scan(@Param('id') id: string, @Body() dto: ScanCheckpointDto, @Request() req: any) {
    const ip = req.ip || req.connection?.remoteAddress;
    return this.service.scanCheckpoint(id, dto, req.user.id, ip);
  }

  @Post(':id/end')
  @Roles(Role.ADMIN, Role.GUARD)
  end(@Param('id') id: string, @Request() req: any) {
    const ip = req.ip || req.connection?.remoteAddress;
    return this.service.end(id, req.user.id, ip);
  }

  @Get('my-active')
  @Roles(Role.ADMIN, Role.GUARD)
  getMyActive(@Request() req: any) {
    return this.service.getMyActiveSession(req.user.id);
  }

  /** Live monitor — admin only */
  @Get('active')
  @Roles(Role.ADMIN)
  getActive() {
    return this.service.getActiveSessions();
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  getStats() {
    return this.service.getStats();
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query() query: FilterSessionsDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GUARD)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
