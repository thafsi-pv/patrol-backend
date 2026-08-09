import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PatrolLogsFilterDto } from './dto/patrol-logs-filter.dto';
import { ScanDto } from './dto/scan.dto';
import { PatrolService } from './patrol.service';

@Controller('patrol')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatrolController {
  constructor(private readonly patrolService: PatrolService) {}

  @Post('scan')
  @Roles(Role.ADMIN, Role.GUARD)
  scan(@Body() dto: ScanDto, @Request() req: any) {
    return this.patrolService.scan(dto, req.user.id);
  }

  @Get('logs')
  @Roles(Role.ADMIN)
  findLogs(@Query() filters: PatrolLogsFilterDto) {
    return this.patrolService.findLogs(filters);
  }

  @Get('logs/:id')
  @Roles(Role.ADMIN)
  findOneLog(@Param('id') id: string) {
    return this.patrolService.findOneLog(id);
  }

  @Get('dashboard-stats')
  @Roles(Role.ADMIN)
  getDashboardStats() {
    return this.patrolService.getDashboardStats();
  }
}
