import { Permissions } from '@lib/core';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { TodoEntity } from './todo.entity';
import { TodoService } from './todo.service';

@Permissions('change_profile')
@ApiTags('todo')
@Crud({
  model: {
    type: TodoEntity,
  },
})
@Controller('/todo')
export class TodoController implements CrudController<TodoEntity> {
  constructor(public service: TodoService) {}
}
