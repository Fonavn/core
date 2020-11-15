import { ChildEntity, Column } from 'typeorm';
import { ProductEntity } from './product.entity';

@ChildEntity()
export class FoodEntity extends ProductEntity {
  @Column()
  psid: string;
}
