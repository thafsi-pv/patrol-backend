import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
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
  @Roles('ADMIN', 'GUARD')
  start(@Body() dto: StartPatrolDto, @Request() req: any) {
    const ip = req.ip || req.connection?.remoteAddress;
    return this.service.start(dto, req.user.id, ip);
  }

  @Post(':id/scan')
  @Roles('ADMIN', 'GUARD')
  scan(@Param('id') id: string, @Body() dto: ScanCheckpointDto, @Request() req: any) {
    const ip = req.ip || req.connection?.remoteAddress;
    return this.service.scanCheckpoint(id, dto, req.user.id, ip);
  }

  @Post(':id/end')
  @Roles('ADMIN', 'GUARD')
  end(@Param('id') id: string, @Request() req: any) {
    const ip = req.ip || req.connection?.remoteAddress;
    return this.service.end(id, req.user.id, ip);
  }

  @Get('active')
  @Roles('ADMIN', 'GUARD')
  getActive() {
    return this.service.getActiveSessions();
  }

  @Get('stats')
  @Roles('ADMIN')
  getStats() {
    return this.service.getStats();
  }

  @Get()
  @Roles('ADMIN')
  findAll(@Query() query: FilterSessionsDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Roles('ADMIN', 'GUARD')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
