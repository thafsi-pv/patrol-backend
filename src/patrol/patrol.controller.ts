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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PatrolLogsFilterDto } from './dto/patrol-logs-filter.dto';
import { ScanDto } from './dto/scan.dto';
import { PatrolService } from './patrol.service';

@Controller('patrol')
@UseGuards(JwtAuthGuard)
export class PatrolController {
  constructor(private readonly patrolService: PatrolService) {}

  @Post('scan')
  scan(@Body() dto: ScanDto, @Request() req: any) {
    return this.patrolService.scan(dto, req.user.id);
  }

  @Get('logs')
  findLogs(@Query() filters: PatrolLogsFilterDto) {
    return this.patrolService.findLogs(filters);
  }

  @Get('logs/:id')
  findOneLog(@Param('id') id: string) {
    return this.patrolService.findOneLog(id);
  }

  @Get('dashboard-stats')
  getDashboardStats() {
    return this.patrolService.getDashboardStats();
  }
}
