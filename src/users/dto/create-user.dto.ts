import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsString()
  @IsOptional()
  mobileNumber?: string;

  @IsBoolean()
  @IsOptional()
  whatsappAlertEnabled?: boolean;
}
