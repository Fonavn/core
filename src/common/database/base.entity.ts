import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  VersionColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class BaseEntity {
  @CreateDateColumn()
  created!: Date;

  @UpdateDateColumn()
  updated!: Date;

  @DeleteDateColumn()
  deleted: Date;

  @VersionColumn()
  version: number;
}
