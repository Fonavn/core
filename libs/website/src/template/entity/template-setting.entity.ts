import { BaseEntity } from '@lib/shared';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TemplateEntity } from './template.entity';

@Entity('template-setting')
export class TemplateSettingEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: string;

  @OneToOne(() => TemplateEntity)
  template: TemplateEntity;

  /**
   * type: input | button
   * src: image.png....
   *
   * OR
   *
   * Key - value
   *
   * settings:
   *  - currency
   *  - default timezone
   *
   *  - header
   *  - foodter
   *      - contact
   *  - body
   *
   *  - background
   *  - tone
   *  - Pages
   *
   * tracking:
   *  - GA, pixel
   *
   * pages
   *  - theme
   *
   * Map collections should be in page
   *
   */
  @Column()
  settings: JSON;
}
