import { ChildEntity, Column } from 'typeorm';
import { FacebookEntity } from './facebook.entity';

@ChildEntity()
export class PsidEntity extends FacebookEntity {
  @Column()
  psid: string;
}
