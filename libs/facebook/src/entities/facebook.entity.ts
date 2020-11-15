import { BaseEntity } from '@lib/shared';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';
import { PageEntity } from './page.entity';

enum FbUser {
  PSID = 'psid',
  ASID = 'asid',
  FBID = 'fbid',
}

@Entity('facebook')
@TableInheritance({ column: { type: 'enum', enum: FbUser } })
export class FacebookEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @ManyToOne(() => PageEntity, { onDelete: 'CASCADE' })
  page: PageEntity;
}
