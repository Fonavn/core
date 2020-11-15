import { User } from '@lib/core';
import { BaseEntity } from '@lib/shared';
import {
  Column,
  Entity,
  Generated,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('page')
export class PageEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Generated('increment')
  seq: number;

  @Column({ unique: true, nullable: false })
  pid: string;

  @Column({ nullable: false })
  ptoken: string;

  @ManyToOne(() => User)
  owner!: User;
}
