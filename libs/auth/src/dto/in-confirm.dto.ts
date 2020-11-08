import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class InConfirmDto {
  @IsString()
  @MaxLength(128)
  @ApiProperty()
  code: string;
}
