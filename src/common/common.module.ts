import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseEntity } from 'src/tenant/database/database.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DatabaseEntity])],
})
export class CommonModule {}
