import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { R2StorageService } from './r2-storage.service';

@Module({
  controllers: [IncidentsController],
  providers: [IncidentsService, R2StorageService],
  exports: [IncidentsService, R2StorageService],
})
export class IncidentsModule {}
