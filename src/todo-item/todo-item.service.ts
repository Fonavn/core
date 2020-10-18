import { QueryService } from '@nestjs-query/core'
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { Inject } from '@nestjs/common';
import { TENANT_CONNECTION } from 'src/tenant/const';
import { TenantService } from 'src/tenant/tenant-service.decorator';
import { Connection } from 'typeorm';
import { TodoItemEntity } from './todo-item.entity';

@QueryService(TodoItemEntity)
@TenantService()
export class TodoItemService extends TypeOrmQueryService<TodoItemEntity> {
  constructor(
    @Inject(TENANT_CONNECTION) private connection: Connection,
  ) {
    super(connection.getRepository(TodoItemEntity));
  }
}