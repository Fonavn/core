import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber } from 'class-validator';

export class OutTodoDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  @IsBoolean()
  completed: boolean;

  @ApiProperty()
  @IsDate()
  created: Date;

  @ApiProperty()
  @IsDate()
  updated: Date;
}
