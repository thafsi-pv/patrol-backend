import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CheckpointsService } from './checkpoints.service';
import { CreateCheckpointDto, UpdateCheckpointDto } from './dto/checkpoint.dto';

@Controller('checkpoints')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckpointsController {
  constructor(private readonly checkpointsService: CheckpointsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateCheckpointDto, @Request() req: any) {
    return this.checkpointsService.create(dto, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GUARD)
  findAll() {
    return this.checkpointsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GUARD)
  findOne(@Param('id') id: string) {
    return this.checkpointsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCheckpointDto) {
    return this.checkpointsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.checkpointsService.remove(id);
  }

  @Get(':id/qr-image')
  @Roles(Role.ADMIN)
  async getQrImage(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.checkpointsService.getQrImage(id);
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="checkpoint-${id}.png"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
