import { BaseEntity } from '@lib/shared';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';

enum ProductType {
  GENERAL = 'general',
  FOOD = 'food',
  DRINK = 'drink',
  TOPPING = 'topping',
}

@Entity('product')
@TableInheritance({ column: { type: 'enum', enum: ProductType } })
export class ProductEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  name!: string;

  @Column()
  price!: string;

  @Column()
  tags: JSON;
}
