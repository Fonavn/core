import { ChildEntity, Column } from 'typeorm';
import { ProductEntity } from './product.entity';

@ChildEntity()
export class DrinkEntity extends ProductEntity {
  @Column()
  psid: string;
}
