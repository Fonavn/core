import { Permissions } from '@lib/core';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { InTodoDto } from './dto/in-todo.dto';
import { TodoEntity } from './todos.entity';
import { TodoService } from './todos.service';

@Permissions('change_profile')
@ApiTags('todos')
@Crud({
  model: {
    type: TodoEntity,
  },
  dto: {
    create: InTodoDto,
    update: InTodoDto,
  },
})
@Controller('/todos')
export class TodoController implements CrudController<TodoEntity> {
  constructor(public service: TodoService) {}
}
