import { BaseEntity } from '@lib/shared';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SiteEntity } from '../site/site.entity';
import { PageEntity } from './page.entity';

enum TemplateType {
  HTML = 'html',
  EJS = 'ejs',
  HANDLEBARS = 'handlerbars',
}

@Entity('template')
export class TemplateEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: string;

  @ManyToOne(() => SiteEntity)
  site: SiteEntity;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  folderPath: string;

  @Column({ type: 'enum', enum: TemplateType })
  templateType: string;

  @OneToMany(
    () => PageEntity,
    page => page.template,
  )
  pages: PageEntity[];
}
