import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class InResetPasswordDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @MaxLength(128)
  @ApiProperty()
  code: string;

  @IsString()
  @MaxLength(32)
  @ApiProperty()
  newPassword: string;
}
