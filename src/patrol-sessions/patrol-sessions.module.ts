import { Module } from '@nestjs/common';
import { PatrolSessionsController } from './patrol-sessions.controller';
import { PatrolSessionsService } from './patrol-sessions.service';

@Module({
  controllers: [PatrolSessionsController],
  providers: [PatrolSessionsService],
  exports: [PatrolSessionsService],
})
export class PatrolSessionsModule {}
