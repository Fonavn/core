import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { InDatabaseDto } from '../databases/dto/in-database.dto';

export class OutTenantDto {
  @ApiProperty()
  @IsString()
  path: string;

  @ApiProperty()
  @IsString()
  host: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ type: InDatabaseDto })
  @Type(() => InDatabaseDto)
  @IsOptional()
  database: InDatabaseDto;
}
