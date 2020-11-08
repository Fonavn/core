import { Group } from '@lib/core/entities/group.entity';
import { Permission } from '@lib/core/entities/permission.entity';
import { User } from '@lib/core/entities/user.entity';
import { TenantEntity } from '@lib/tenant/tenant.entity';
import { plainToClass } from 'class-transformer';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class PermissionSeed implements MigrationInterface {
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
    const addPermissionPermission = await queryRunner.manager
      .getRepository(Permission)
      .findOneOrFail({
        where: {
          name: 'add_permission',
        },
      });
    const changePermissionPermission = await queryRunner.manager
      .getRepository(Permission)
      .findOneOrFail({
        where: {
          name: 'change_permission',
        },
      });
    const deletePermissionPermission = await queryRunner.manager
      .getRepository(Permission)
      .findOneOrFail({
        where: {
          name: 'delete_permission',
        },
      });
    const readPermissionPermission = await queryRunner.manager
      .getRepository(Permission)
      .findOneOrFail({
        where: {
          name: 'read_permission',
        },
      });
    const masterTenant = await queryRunner.manager
      .getRepository(TenantEntity)
      .findOneOrFail({
        where: {
          path: 'master',
        },
      });
    const gAddPermission = await queryRunner.manager
      .getRepository<Group>(Group)
      .save(
        plainToClass(Group, {
          name: 'add_permission',
          title: 'Add permission',
          permissions: [addPermissionPermission],
        }),
      );
    const gChangePermission = await queryRunner.manager
      .getRepository<Group>(Group)
      .save(
        plainToClass(Group, {
          name: 'change_permission',
          title: 'Change permission',
          permissions: [changePermissionPermission],
        }),
      );
    const gDeletePermission = await queryRunner.manager
      .getRepository<Group>(Group)
      .save(
        plainToClass(Group, {
          name: 'delete_permission',
          title: 'Delete permission',
          permissions: [deletePermissionPermission],
        }),
      );
    const gReadPermission = await queryRunner.manager
      .getRepository<Group>(Group)
      .save(
        plainToClass(Group, {
          name: 'read_permission',
          title: 'Read permission',
          permissions: [readPermissionPermission],
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
          groups: [gAdmin],
        },
        {
          username: 'addPermissionUser',
          email: 'addPermissionUser@addPermissionUser.com',
          ...tempUser.createPassword('12345678'),
          firstName: 'AddPermissionUserFirstName',
          lastName: 'AddPermissionUserLastName',
          isSuperuser: false,
          isStaff: false,
          isActive: false,
          tenant: masterTenant,
          groups: [gAddPermission],
        },
        {
          username: 'changePermissionUser',
          email: 'changePermissionUser@changePermissionUser.com',
          ...tempUser.createPassword('12345678'),
          firstName: 'ChangePermissionUserFirstName',
          lastName: 'ChangePermissionUserLastName',
          isSuperuser: false,
          isStaff: false,
          isActive: false,
          tenant: masterTenant,
          groups: [gChangePermission],
        },
        {
          username: 'deletePermissionUser',
          email: 'deletePermissionUser@deletePermissionUser.com',
          ...tempUser.createPassword('12345678'),
          firstName: 'DeletePermissionUserFirstName',
          lastName: 'DeletePermissionUserLastName',
          isSuperuser: false,
          isStaff: false,
          isActive: false,
          tenant: masterTenant,
          groups: [gDeletePermission],
        },
        {
          username: 'readPermissionUser',
          email: 'readPermissionUser@readPermissionUser.com',
          ...tempUser.createPassword('12345678'),
          firstName: 'ReadPermissionUserFirstName',
          lastName: 'ReadPermissionUserLastName',
          isSuperuser: false,
          isStaff: false,
          isActive: false,
          tenant: masterTenant,
          groups: [gReadPermission],
        },
      ]),
    );
  }

  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
  public async down(_queryRunner: QueryRunner): Promise<any> {}
}
