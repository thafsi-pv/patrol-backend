import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CheckpointsModule } from './checkpoints/checkpoints.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PatrolModule } from './patrol/patrol.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { IncidentsModule } from './incidents/incidents.module';
import { RoutesModule } from './routes/routes.module';
import { PatrolSessionsModule } from './patrol-sessions/patrol-sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CheckpointsModule,
    PatrolModule,
    IncidentsModule,
    RoutesModule,
    PatrolSessionsModule,
  ],
  controllers: [AppController],
  providers: [

    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
