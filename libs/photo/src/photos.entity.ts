import { BaseEntity } from '@lib/shared';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export abstract class PhotoEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: string;

  @Column({ nullable: true })
  public name: string;

  @Column({ nullable: true })
  public mimeType: string;

  @Column({ nullable: true })
  public encoding: string;

  @Column({ nullable: true })
  public description: string;
}
