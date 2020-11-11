import { TenantEntity } from '@lib/tenant/tenant.entity';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  validateSync,
} from 'class-validator';
import { SHA256 } from 'crypto-js';
import * as uuid from 'uuid';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Group } from '../entities/group.entity';
import { CustomValidationError } from '../exceptions/custom-validation.error';
import * as moment from 'moment';

const EXPIRED_CONFIRMATION_DAYS = 10;
const EXPIRED_RESET_PASSWORD_MINUTES = 120;
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number = undefined;

  @Column({ length: 128 })
  @MaxLength(128)
  @IsOptional()
  password: string = undefined;

  @Column({ length: 128, nullable: true })
  @MaxLength(128)
  @IsOptional()
  salt: string = undefined;

  @Column({ name: 'confirm_code', length: 128, nullable: true })
  @MaxLength(128)
  @IsOptional()
  confirmCode: string = undefined;

  @Column({ name: 'expired_confirm', nullable: true })
  @IsOptional()
  @IsDate()
  expiredConfirm: Date = undefined;

  @Column({ name: 'reset_pw_code', length: 128, nullable: true })
  @MaxLength(128)
  @IsOptional()
  resetPwCode: string = undefined;

  @Column({ name: 'expired_reset_pw', nullable: true })
  @IsOptional()
  @IsDate()
  expiredResetPw: Date = undefined;

  @UpdateDateColumn({ name: 'last_login', nullable: true })
  lastLogin: Date = undefined;

  @Column({ name: 'is_superuser', default: false })
  isSuperuser: boolean = undefined;

  @Column({ length: 150, unique: true })
  @MaxLength(150)
  username: string = undefined;

  @Column({ name: 'first_name', length: 30, nullable: true })
  @MaxLength(30)
  @IsOptional()
  firstName: string = undefined;

  @Column({ name: 'last_name', length: 30, nullable: true })
  @MaxLength(30)
  @IsOptional()
  lastName: string = undefined;

  @Column({ length: 254, unique: true })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(254)
  email: string = undefined;

  @Column({ name: 'is_staff', default: false })
  isStaff: boolean = undefined;

  @Column({ name: 'is_active', default: false })
  isActive: boolean = undefined;

  @CreateDateColumn({ name: 'date_joined' })
  dateJoined: Date = undefined;

  @Column({ type: Date, name: 'date_of_birth', nullable: true })
  dateOfBirth: Date = undefined;

  @ManyToOne(() => TenantEntity, {
    eager: true,
    nullable: true,
    cascade: ['insert'],
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity = undefined;

  @ManyToMany(() => Group)
  @JoinTable({
    // not work on run cli migration:
    name: 'user_groups',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'group_id',
      referencedColumnName: 'id',
    },
  })
  groups: Group[];

  @BeforeInsert()
  doBeforeInsertion() {
    const errors = validateSync(this, { validationError: { target: false } });
    if (errors.length > 0) {
      throw new CustomValidationError(errors);
    }
  }

  @BeforeUpdate()
  doBeforeUpdate() {
    const errors = validateSync(this, { validationError: { target: false } });
    if (errors.length > 0) {
      throw new CustomValidationError(errors);
    }
  }

  createPassword(password: string) {
    const salt = uuid.v4().toString();
    const hash = SHA256(password + salt).toString();
    return { password: hash, salt };
  }

  validatePassword(password: string) {
    return this.password === SHA256(password + this.salt).toString();
  }

  setPassword(password: string) {
    if (password) {
      const { password: hash, salt } = this.createPassword(password);
      this.password = hash;
      this.salt = salt;
      this.confirmCode = uuid.v4().toString();
      this.expiredConfirm = moment()
        .add(EXPIRED_CONFIRMATION_DAYS, 'days')
        .toDate();
    }
    return this;
  }

  resetPwInit() {
    this.resetPwCode = uuid.v4().toString();
    this.expiredResetPw = moment()
      .add(EXPIRED_RESET_PASSWORD_MINUTES, 'minutes')
      .toDate();
  }

  checkPermissions(permissions: string[]) {
    permissions = permissions.map(permission => permission.toLowerCase());
    return (
      this.groups.filter(
        group =>
          group &&
          group.permissions.filter(
            permission =>
              permissions.indexOf(permission.name.toLowerCase()) !== -1,
          ).length > 0,
      ).length > 0
    );
  }
}
