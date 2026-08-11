import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class StartPatrolDto {
  @IsString()
  @IsNotEmpty()
  routeId: string;

  @IsString()
  @IsOptional()
  shift?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}

export class ScanCheckpointDto {
  @IsString()
  @IsNotEmpty()
  qrCode: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  @IsOptional()
  accuracy?: number;

  @IsIn(['NORMAL', 'ISSUE_FOUND', 'EMERGENCY'])
  @IsOptional()
  severity?: 'NORMAL' | 'ISSUE_FOUND' | 'EMERGENCY';

  @IsString()
  @IsOptional()
  remarks?: string;

  // Optional uploaded media attachments to attach to this checkpoint scan
  @IsArray()
  @IsOptional()
  images?: { imageUrl: string; r2Key: string; mediaType?: string }[];

  @IsString()
  @IsOptional()
  deviceId?: string;
}

export class FilterSessionsDto {
  @IsString()
  @IsOptional()
  guardId?: string;

  @IsString()
  @IsOptional()
  routeId?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  shift?: string;

  @IsString()
  @IsOptional()
  from?: string;

  @IsString()
  @IsOptional()
  to?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit?: number;
}

