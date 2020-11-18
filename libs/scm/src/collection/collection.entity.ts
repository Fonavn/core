import { BaseEntity } from '@lib/shared';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';
import { ProductEntity } from '../product/entity/product.entity';

enum ProductType {
  GENERAL = 'general',
  FOOD = 'food',
  DRINK = 'drink',
  TOPPING = 'topping',
}

@Entity('collection')
export class CollectionEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @ManyToMany(() => ProductEntity, {
    cascade: ['remove'],
  })
  @JoinTable({
    // not work on run cli migration:
    name: 'collection_products',
    joinColumn: {
      name: 'collection_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
  })
  products: ProductEntity[];
}
