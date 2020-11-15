import { ChildEntity, Column } from 'typeorm';
import { FacebookEntity } from './facebook.entity';

@ChildEntity()
export class FbidEntity extends FacebookEntity {
  @Column()
  fbid: string;
}
