import { IsString, IsNotEmpty, IsOptional, IsArray, ArrayMinSize } from 'class-validator';

export class GetPresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsString()
  @IsOptional()
  fileExtension?: string;
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
  @ArrayMinSize(1)
  images: { imageUrl: string; r2Key: string }[];
}
