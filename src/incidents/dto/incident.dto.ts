import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class GetPresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsString()
  @IsOptional()
  fileExtension?: string;

  @IsString()
  @IsOptional()
  resourceType?: string; // 'image' | 'video' | 'raw' | 'auto'
}

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  checkpointId?: string;

  @IsString()
  @IsOptional()
  patrolLogId?: string;

  @IsArray()
  @IsOptional()
  images?: { imageUrl: string; r2Key: string }[];
}

