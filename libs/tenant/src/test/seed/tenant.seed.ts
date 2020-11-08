import { ContentType, Group } from '@lib/core';
import { Permission } from '@lib/core/entities/permission.entity';
import { User } from '@lib/core/entities/user.entity';
import { TenantEntity } from '@lib/tenant/tenant.entity';
import { plainToClass } from 'class-transformer';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class TenantSeed implements MigrationInterface {
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
    const addTenantPermission = await queryRunner.manager
      .getRepository(Permission)
      .findOneOrFail({
        where: {
          name: 'add_tenant',
        },
      });
    const changeTenantPermission = await queryRunner.manager
      .getRepository(Permission)
      .findOneOrFail({
        where: {
          name: 'change_tenant',
        },
      });
    const deleteTenantPermission = await queryRunner.manager
      .getRepository(Permission)
      .findOneOrFail({
        where: {
          name: 'delete_tenant',
        },
      });
    const readTenantPermission = await queryRunner.manager
      .getRepository(Permission)
      .findOneOrFail({
        where: {
          name: 'read_tenant',
        },
      });
    const masterTenant = await queryRunner.manager
      .getRepository(TenantEntity)
      .findOneOrFail({
        where: {
          path: 'master',
        },
      });
    const gAddTenant = await queryRunner.manager
      .getRepository<Group>(Group)
      .save(
        plainToClass(Group, {
          name: 'add_tenant',
          title: 'Add tenant',
          permissions: [addTenantPermission],
        }),
      );
    const gChangeTenant = await queryRunner.manager
      .getRepository<Group>(Group)
      .save(
        plainToClass(Group, {
          name: 'change_tenant',
          title: 'Change tenant',
          permissions: [changeTenantPermission],
        }),
      );
    const gDeleteTenant = await queryRunner.manager
      .getRepository<Group>(Group)
      .save(
        plainToClass(Group, {
          name: 'delete_tenant',
          title: 'Delete tenant',
          permissions: [deleteTenantPermission],
        }),
      );
    const gReadTenant = await queryRunner.manager
      .getRepository<Group>(Group)
      .save(
        plainToClass(Group, {
          name: 'read_tenant',
          title: 'Read tenant',
          permissions: [readTenantPermission],
        }),
      );
    await queryRunner.manager.getRepository<User>(User).save(
      plainToClass(User, [
        {
          username: 'inactiveAdmin',
          email: 'inactiveAdmin@inactiveAdmin.com',
          password: await tempUser.createPassword('12345678'),
          firstName: 'InactiveAdminFirstName',
          lastName: 'InactiveAdminLastName',
          isSuperuser: false,
          isStaff: false,
          isActive: false,
          tenant: masterTenant,
          tenants: [gAdmin],
        },
        {
          username: 'addTenantUser',
          email: 'addTenantUser@addTenantUser.com',
          password: await tempUser.createPassword('12345678'),
          firstName: 'AddTenantUserFirstName',
          lastName: 'AddTenantUserLastName',
          isSuperuser: false,
          isStaff: false,
          isActive: false,
          tenant: masterTenant,
          tenants: [gAddTenant],
        },
        {
          username: 'changeTenantUser',
          email: 'changeTenantUser@changeTenantUser.com',
          password: await tempUser.createPassword('12345678'),
          firstName: 'ChangeTenantUserFirstName',
          lastName: 'ChangeTenantUserLastName',
          isSuperuser: false,
          isStaff: false,
          isActive: false,
          tenant: masterTenant,
          tenants: [gChangeTenant],
        },
        {
          username: 'deleteTenantUser',
          email: 'deleteTenantUser@deleteTenantUser.com',
          password: await tempUser.createPassword('12345678'),
          firstName: 'DeleteTenantUserFirstName',
          lastName: 'DeleteTenantUserLastName',
          isSuperuser: false,
          isStaff: false,
          isActive: false,
          tenant: masterTenant,
          tenants: [gDeleteTenant],
        },
        {
          username: 'readTenantUser',
          email: 'readTenantUser@readTenantUser.com',
          password: await tempUser.createPassword('12345678'),
          firstName: 'ReadTenantUserFirstName',
          lastName: 'ReadTenantUserLastName',
          isSuperuser: false,
          isStaff: false,
          isActive: false,
          tenant: masterTenant,
          tenants: [gReadTenant],
        },
      ]),
    );
  }

  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
  public async down(_queryRunner: QueryRunner): Promise<any> {}
}
