import { Module } from '@nestjs/common';
import { PatrolSessionsController } from './patrol-sessions.controller';
import { PatrolSessionsService } from './patrol-sessions.service';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [WhatsAppModule],
  controllers: [PatrolSessionsController],
  providers: [PatrolSessionsService],
  exports: [PatrolSessionsService],
})
export class PatrolSessionsModule {}
