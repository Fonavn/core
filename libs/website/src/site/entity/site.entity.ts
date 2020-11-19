import { BaseEntity } from '@lib/shared';
import { TenantEntity } from '@lib/tenant/tenant.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TemplateEntity } from '../../template/entity/template.entity';

@Entity('site')
export class SiteEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: string;

  @ManyToOne(() => TenantEntity)
  tenant: TenantEntity;

  @ManyToOne(() => TemplateEntity)
  template: TemplateEntity;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  host: string;

  @Column()
  folderPath: string;
}
