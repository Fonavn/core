import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { InUpdateDatabaseDto } from '../databases/dto/in-update-database.dto';

export class InUpdateTenantDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  path: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  host: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @Type(() => InUpdateDatabaseDto)
  @IsOptional()
  database: InUpdateDatabaseDto;
}
