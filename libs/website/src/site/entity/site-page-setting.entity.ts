import { BaseEntity } from '@lib/shared';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PageSettingEntity } from '../../template/entity/page-setting.entity';
import { SiteEntity } from './site.entity';

@Entity('site-page-setting')
export class SitePageSettingEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: string;

  @Column()
  path: string;

  @ManyToOne(() => SiteEntity)
  site: SiteEntity;

  @ManyToOne(() => PageSettingEntity)
  templateSetting: PageSettingEntity;

  @Column()
  settings: JSON;
}
