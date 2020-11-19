import { BaseEntity } from '@lib/shared';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SiteEntity } from './site.entity';

@Entity('site-setting')
export class SiteSettingEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: string;

  @Column()
  siteId: string;

  @OneToOne(() => SiteEntity)
  @JoinColumn({ name: 'site_id' })
  site: SiteEntity;

  @Column()
  settings: JSON;
}
