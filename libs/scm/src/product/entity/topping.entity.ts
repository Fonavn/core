import { ChildEntity, Column } from 'typeorm';
import { ProductEntity } from './product.entity';

@ChildEntity()
export class ToppingEntity extends ProductEntity {
  @Column()
  psid: string;
}
