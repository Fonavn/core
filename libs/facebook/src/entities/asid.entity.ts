import { ChildEntity, Column } from 'typeorm';
import { FacebookEntity } from './facebook.entity';

@ChildEntity()
export class TodoEntity extends FacebookEntity {
  @Column()
  asid: string;
}
