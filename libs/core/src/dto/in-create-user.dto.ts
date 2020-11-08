import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { GroupDto } from '../dto/group.dto';

export class InCreateUserDto {
  @IsOptional()
  id: number;

  @MaxLength(128)
  @ApiPropertyOptional()
  password: string;

  @ApiPropertyOptional({ type: String })
  lastLogin: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSuperuser: boolean;

  @MaxLength(150)
  @ApiProperty()
  username: string;

  @MaxLength(30)
  @ApiProperty()
  firstName: string;

  @MaxLength(30)
  @ApiProperty()
  lastName: string;

  @MaxLength(254)
  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isStaff: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ type: String })
  dateJoined: Date;

  @ApiPropertyOptional({ type: String })
  dateOfBirth: Date;

  @Type(() => GroupDto)
  @ApiProperty({ type: GroupDto, isArray: true })
  groups: GroupDto[];
}
