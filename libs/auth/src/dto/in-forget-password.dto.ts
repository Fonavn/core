import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class InForgetPasswordDto {
  @IsEmail()
  @ApiProperty()
  email: string;
}
