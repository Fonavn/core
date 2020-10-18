import { BaseEntity } from 'src/common/database/base.entity';
import { DatabaseType, VarcharLength } from 'src/common/database/const';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('database')
export class DatabaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column({ enum: DatabaseType })
  type!: string;

  @Column({
    type: "varchar",
    length: VarcharLength.TINY,
    nullable: true,
  })
  host: string;

  @Column({
    type: "int",
    nullable: true,
  })
  port!: number;

  @Column({
    type: "varchar",
    length: VarcharLength.TINY,
    nullable: false,
  })
  username!: string;

  @Column({
    type: "varchar",
    length: VarcharLength.TINY,
    nullable: true,
  })
  password!: string;

  @Column({
    type: "varchar",
    length: VarcharLength.TINY,
    nullable: false,
  })
  database!: string;
}