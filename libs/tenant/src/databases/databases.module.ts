import { forwardRef, Module } from '@nestjs/common';
import { DatabaseService } from './databases.service';
import { DatabaseController } from './databases.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseEntity } from './databases.entity';
import { TenantModule } from '../tenant.module';

@Module({
  imports: [
    forwardRef(() => TenantModule),
    TypeOrmModule.forFeature([DatabaseEntity]),
  ],
  providers: [DatabaseService],
  controllers: [DatabaseController],
})
export class DatabaseModule {}
