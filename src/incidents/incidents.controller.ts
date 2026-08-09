import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { Role } from '@prisma/client';
import { IncidentsService } from './incidents.service';
import { R2StorageService } from './r2-storage.service';
import { CreateIncidentDto, GetPresignedUrlDto } from './dto/incident.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidentsController {
  constructor(
    private readonly incidentsService: IncidentsService,
    private readonly r2StorageService: R2StorageService,
  ) {}

  @Post('upload-url')
  @Roles(Role.ADMIN, Role.GUARD)
  async getPresignedUrl(@Body() dto: GetPresignedUrlDto) {
    return this.r2StorageService.generatePresignedUrl(
      dto.contentType,
      dto.fileExtension,
    );
  }

  @Post()
  @Roles(Role.ADMIN, Role.GUARD)
  async createIncident(@Body() dto: CreateIncidentDto, @Request() req: any) {
    return this.incidentsService.create(dto, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN)
  async getIncidents() {
    return this.incidentsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async getIncident(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }
}
