import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class InChangePasswordDto {
  @IsString()
  @MaxLength(32)
  @ApiProperty()
  oldPassword: string;

  @IsString()
  @MaxLength(32)
  @ApiProperty()
  newPassword: string;
}
