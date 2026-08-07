import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { R2StorageService } from './r2-storage.service';
import { CreateIncidentDto, GetPresignedUrlDto } from './dto/incident.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(
    private readonly incidentsService: IncidentsService,
    private readonly r2StorageService: R2StorageService,
  ) {}

  @Post('upload-url')
  async getPresignedUrl(@Body() dto: GetPresignedUrlDto) {
    return this.r2StorageService.generatePresignedUrl(
      dto.contentType,
      dto.fileExtension,
    );
  }

  @Post()
  async createIncident(@Body() dto: CreateIncidentDto, @Request() req: any) {
    return this.incidentsService.create(dto, req.user.id);
  }

  @Get()
  async getIncidents() {
    return this.incidentsService.findAll();
  }

  @Get(':id')
  async getIncident(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }
}
