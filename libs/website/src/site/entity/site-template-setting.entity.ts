import { BaseEntity } from '@lib/shared';
import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TemplateSettingEntity } from '../../template/entity/template-setting.entity';
import { SiteEntity } from './site.entity';

@Entity('site-template-setting')
export class SiteTemplateSettingEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: string;

  @Column()
  siteId: string;

  @OneToOne(() => SiteEntity)
  site: SiteEntity;

  @ManyToOne(() => TemplateSettingEntity)
  templateSetting: TemplateSettingEntity;

  @Column()
  settings: JSON;
}
