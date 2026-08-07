import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PatrolStatus } from '@prisma/client';

export class PatrolLogsFilterDto {
  @IsString()
  @IsOptional()
  checkpointId?: string;

  @IsString()
  @IsOptional()
  guardId?: string;

  @IsEnum(PatrolStatus)
  @IsOptional()
  status?: PatrolStatus;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
