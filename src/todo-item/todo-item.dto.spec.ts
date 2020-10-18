import { TodoItemDTO } from './todo-item.dto';

describe('TodoItemDto', () => {
  it('should be defined', () => {
    expect(new TodoItemDTO()).toBeDefined();
  });
});
