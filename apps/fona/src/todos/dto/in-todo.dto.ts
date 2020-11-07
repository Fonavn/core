import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, MaxLength } from 'class-validator';

export class InTodoDto {
  @MaxLength(128)
  @ApiProperty()
  title: string;

  @ApiProperty()
  @IsBoolean()
  completed: boolean;
}
