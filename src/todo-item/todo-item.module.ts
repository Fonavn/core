import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { TenantModule } from 'src/tenant/tenant.module';
import { TodoItemDTO } from './todo-item.dto';
import { TodoItemEntity } from './todo-item.entity';
import { TodoItemService } from './todo-item.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      // import the NestjsQueryTypeOrmModule to register the entity with typeorm
      // and provide a QueryService
      imports: [NestjsQueryTypeOrmModule.forFeature([TodoItemEntity]), TenantModule],
      services: [TodoItemService],
      // describe the resolvers you want to expose
      resolvers: [{ DTOClass: TodoItemDTO, EntityClass: TodoItemEntity, ServiceClass: TodoItemService }],
    }),
  ],
})
export class TodoItemModule { }