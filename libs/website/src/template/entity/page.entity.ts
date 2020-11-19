import { BaseEntity } from '@lib/shared';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TemplateEntity } from './template.entity';

@Entity('page')
export class PageEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  path: string;

  @ManyToOne(() => TemplateEntity)
  template: TemplateEntity;
}
