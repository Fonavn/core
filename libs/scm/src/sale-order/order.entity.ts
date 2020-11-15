import { BaseEntity } from '@lib/shared';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';
import { OrderItemEntity } from './order-item.entity';

enum ProductType {
  PSID = 'general',
  ASID = 'food',
  FBID = 'drink',
}

@Entity('order')
export class OrderEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @OneToMany(
    () => OrderItemEntity,
    item => item.order,
  )
  items: OrderItemEntity[];
}
