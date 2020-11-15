import { BaseEntity } from '@lib/shared';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from '../product/entity/product.entity';
import { OrderEntity } from './order.entity';

@Entity('order-item')
export class OrderItemEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  product!: ProductEntity;

  @Column()
  qty!: number;

  @Column()
  price!: string;

  @ManyToOne(
    () => OrderEntity,
    order => order.items,
  )
  order!: OrderEntity;
}
