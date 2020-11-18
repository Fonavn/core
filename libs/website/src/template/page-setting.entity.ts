import { BaseEntity } from '@lib/shared';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TemplateEntity } from './template.entity';

@Entity('page-setting')
export class PageSettingEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: string;

  @OneToOne(() => TemplateEntity)
  template: TemplateEntity;

  /**
   * page:
   *  - title
   *
   * data:
   *  - collections
   *      - hot products
   *      - new products
   *      - promotion products
   *
   *  - product detail
   *
   *  - other
   */
  @Column()
  settings: JSON;
}
