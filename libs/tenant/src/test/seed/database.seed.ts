import { ContentType, Group } from '@lib/core';
import { Permission } from '@lib/core/entities/permission.entity';
import { User } from '@lib/core/entities/user.entity';
import { TenantEntity } from '@lib/tenant/tenant.entity';
import { plainToClass } from 'class-transformer';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class DatabaseSeed implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const tempUser = new User();
    const gAdmin = await queryRunner.manager
      .getRepository(Group)
      .findOneOrFail({
        where: {
          name: 'admin',
        },
        relations: ['permissions'],
      });
    const addDatabasePermission = await queryRunner.manager
      .getRepository(Permission)
      .findOneOrFail({
        where: {
          name: 'add_database',
        },
      });
    const changeDatabasePermission = await queryRunner.manager
      .getRepository(Permission)
      .findOneOrFail({
        where: {
          name: 'change_database',
        },
      });
    const deleteDatabasePermission = await queryRunner.manager
      .getRepository(Permission)
      .findOneOrFail({
        where: {
          name: 'delete_database',
        },
      });
    const readDatabasePermission = await queryRunner.manager
      .getRepository(Permission)
      .findOneOrFail({
        where: {
          name: 'read_database',
        },
      });
    const masterTenant = await queryRunner.manager
      .getRepository(TenantEntity)
      .findOneOrFail({
        where: {
          path: 'master',
        },
      });
    const gAddDatabase = await queryRunner.manager
      .getRepository<Group>(Group)
      .save(
        plainToClass(Group, {
          name: 'add_database',
          title: 'Add database',
          permissions: [addDatabasePermission],
        }),
      );
    const gChangeDatabase = await queryRunner.manager
      .getRepository<Group>(Group)
      .save(
        plainToClass(Group, {
          name: 'change_database',
          title: 'Change database',
          permissions: [changeDatabasePermission],
        }),
      );
    const gDeleteDatabase = await queryRunner.manager
      .getRepository<Group>(Group)
      .save(
        plainToClass(Group, {
          name: 'delete_database',
          title: 'Delete database',
          permissions: [deleteDatabasePermission],
        }),
      );
    const gReadDatabase = await queryRunner.manager
      .getRepository<Group>(Group)
      .save(
        plainToClass(Group, {
          name: 'read_database',
          title: 'Read database',
          permissions: [readDatabasePermission],
        }),
      );
    await queryRunner.manager.getRepository<User>(User).save(
      plainToClass(User, [
        {
          username: 'inactiveAdmin',
          email: 'inactiveAdmin@inactiveAdmin.com',
          ...tempUser.createPassword('12345678'),
          firstName: 'InactiveAdminFirstName',
          lastName: 'InactiveAdminLastName',
          isSuperuser: false,
          isStaff: false,
          isActive: false,
          tenant: masterTenant,
          databases: [gAdmin],
        },
        {
          username: 'addDatabaseUser',
          email: 'addDatabaseUser@addDatabaseUser.com',
          ...tempUser.createPassword('12345678'),
          firstName: 'AddDatabaseUserFirstName',
          lastName: 'AddDatabaseUserLastName',
          isSuperuser: false,
          isStaff: false,
          isActive: false,
          tenant: masterTenant,
          databases: [gAddDatabase],
        },
        {
          username: 'changeDatabaseUser',
          email: 'changeDatabaseUser@changeDatabaseUser.com',
          ...tempUser.createPassword('12345678'),
          firstName: 'ChangeDatabaseUserFirstName',
          lastName: 'ChangeDatabaseUserLastName',
          isSuperuser: false,
          isStaff: false,
          isActive: false,
          tenant: masterTenant,
          databases: [gChangeDatabase],
        },
        {
          username: 'deleteDatabaseUser',
          email: 'deleteDatabaseUser@deleteDatabaseUser.com',
          ...tempUser.createPassword('12345678'),
          firstName: 'DeleteDatabaseUserFirstName',
          lastName: 'DeleteDatabaseUserLastName',
          isSuperuser: false,
          isStaff: false,
          isActive: false,
          tenant: masterTenant,
          databases: [gDeleteDatabase],
        },
        {
          username: 'readDatabaseUser',
          email: 'readDatabaseUser@readDatabaseUser.com',
          ...tempUser.createPassword('12345678'),
          firstName: 'ReadDatabaseUserFirstName',
          lastName: 'ReadDatabaseUserLastName',
          isSuperuser: false,
          isStaff: false,
          isActive: false,
          tenant: masterTenant,
          databases: [gReadDatabase],
        },
      ]),
    );
  }

  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
  public async down(_queryRunner: QueryRunner): Promise<any> {}
}
