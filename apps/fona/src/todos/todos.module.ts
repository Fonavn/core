import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantModule } from '@lib/tenant';
import { DatabaseEntity } from '@lib/tenant/databases/databases.entity';
import { TenantEntity } from '@lib/tenant/tenant.entity';
import { TodoController } from './todos.controller';
import { TodoEntity } from './todos.entity';
import { TodoService } from './todos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TodoEntity, TenantEntity, DatabaseEntity]),
    TenantModule,
  ],
  providers: [TodoService],
  exports: [TodoService],
  controllers: [TodoController],
})
export class TodoModule {}
