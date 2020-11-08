import { ContentType } from '@lib/core/entities/content-type.entity';
import { Group } from '@lib/core/entities/group.entity';
import { Permission } from '@lib/core/entities/permission.entity';
import { User } from '@lib/core/entities/user.entity';
import { TenantEntity } from '@lib/tenant/tenant.entity';
import { plainToClass } from 'class-transformer';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class BaseSeed implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const ctPermission = await queryRunner.manager
      .getRepository<ContentType>(ContentType)
      .save(
        plainToClass(ContentType, {
          name: 'permission',
          title: 'Permission',
        }),
      );
    const ctGroup = await queryRunner.manager
      .getRepository<ContentType>(ContentType)
      .save(
        plainToClass(ContentType, {
          name: 'group',
          title: 'Group',
        }),
      );
    const ctContentTtype = await queryRunner.manager
      .getRepository<ContentType>(ContentType)
      .save(
        plainToClass(ContentType, {
          name: 'content-type',
          title: 'Content type',
        }),
      );
    const ctUser = await queryRunner.manager
      .getRepository<ContentType>(ContentType)
      .save(plainToClass(ContentType, { name: 'user', title: 'User' }));
    const ctDatabase = await queryRunner.manager
      .getRepository<ContentType>(ContentType)
      .save(
        plainToClass(ContentType, {
          name: 'database',
          title: 'Database',
        }),
      );
    const ctTenant = await queryRunner.manager
      .getRepository<ContentType>(ContentType)
      .save(
        plainToClass(ContentType, {
          name: 'tenant',
          title: 'Tenant',
        }),
      );
    const pPermissions = await queryRunner.manager
      .getRepository<Permission>(Permission)
      .save(
        plainToClass(Permission, [
          {
            title: 'Can add permission',
            name: 'add_permission',
            contentType: ctPermission,
          },
          {
            title: 'Can change permission',
            name: 'change_permission',
            contentType: ctPermission,
          },
          {
            title: 'Can delete permission',
            name: 'delete_permission',
            contentType: ctPermission,
          },
          {
            title: 'Can add group',
            name: 'add_group',
            contentType: ctGroup,
          },
          {
            title: 'Can change group',
            name: 'change_group',
            contentType: ctGroup,
          },
          {
            title: 'Can delete group',
            name: 'delete_group',
            contentType: ctGroup,
          },
          {
            title: 'Can add content type',
            name: 'add_content-type',
            contentType: ctContentTtype,
          },
          {
            title: 'Can change content type',
            name: 'change_content-type',
            contentType: ctContentTtype,
          },
          {
            title: 'Can delete content type',
            name: 'delete_content-type',
            contentType: ctContentTtype,
          },
          {
            title: 'Can add user',
            name: 'add_user',
            contentType: ctUser,
          },
          {
            title: 'Can change user',
            name: 'change_user',
            contentType: ctUser,
          },
          {
            title: 'Can delete user',
            name: 'delete_user',
            contentType: ctUser,
          },
          {
            title: 'Can read user',
            name: 'read_user',
            contentType: ctUser,
          },
          {
            title: 'Can read group',
            name: 'read_group',
            contentType: ctGroup,
          },
          {
            title: 'Can read permission',
            name: 'read_permission',
            contentType: ctPermission,
          },
          {
            title: 'Can read content type',
            name: 'read_content-type',
            contentType: ctContentTtype,
          },
          {
            title: 'Can change profile',
            name: 'change_profile',
            contentType: ctUser,
          },
          {
            title: 'Can add database',
            name: 'add_database',
            contentType: ctDatabase,
          },
          {
            title: 'Can change database',
            name: 'change_database',
            contentType: ctDatabase,
          },
          {
            title: 'Can delete database',
            name: 'delete_database',
            contentType: ctDatabase,
          },
          {
            title: 'Can read database',
            name: 'read_database',
            contentType: ctDatabase,
          },
          {
            title: 'Can add tenant',
            name: 'add_tenant',
            contentType: ctTenant,
          },
          {
            title: 'Can change tenant',
            name: 'change_tenant',
            contentType: ctTenant,
          },
          {
            title: 'Can delete tenant',
            name: 'delete_tenant',
            contentType: ctTenant,
          },
          {
            title: 'Can read tenant',
            name: 'read_tenant',
            contentType: ctTenant,
          },
        ]),
      );
    const gUser = await queryRunner.manager.getRepository<Group>(Group).save(
      plainToClass(Group, {
        name: 'user',
        title: 'User',
        permissions: pPermissions.filter(
          item => item.name === 'change_profile',
        ),
      }),
    );
    const lUser = await queryRunner.manager.getRepository<Group>(Group).save(
      plainToClass(Group, {
        name: 'limit',
        title: 'Limit',
        permissions: [],
      }),
    );
    const gAdmin = await queryRunner.manager.getRepository<Group>(Group).save(
      plainToClass(Group, {
        name: 'admin',
        title: 'Admin',
        permissions: pPermissions,
      }),
    );
    const masterTenant = await queryRunner.manager
      .getRepository<TenantEntity>(TenantEntity)
      .save(
        plainToClass(TenantEntity, {
          name: 'master',
          path: 'master',
          database: {
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'masterUsr',
            password: 1,
            database: 'masterDb',
          },
        }),
      );
    const tempUser = new User();
    await queryRunner.manager.getRepository<User>(User).save(
      plainToClass(User, [
        {
          username: 'super',
          email: 'super@super.com',
          ...tempUser.createPassword('12345678'),
          firstName: 'SuperFirstName',
          lastName: 'SuperLastName',
          isSuperuser: true,
          isStaff: false,
          isActive: true,
          tenant: masterTenant,
          groups: [gAdmin],
        },
        {
          username: 'admin',
          email: 'admin@admin.com',
          ...tempUser.createPassword('12345678'),
          firstName: 'AdminFirstName',
          lastName: 'AdminLastName',
          isSuperuser: false,
          isStaff: false,
          isActive: true,
          tenant: masterTenant,
          groups: [gAdmin],
        },
        {
          username: 'user1',
          email: 'user1@user1.com',
          ...tempUser.createPassword('12345678'),
          firstName: 'User1FirstName',
          lastName: 'User1LastName',
          isSuperuser: false,
          isStaff: false,
          isActive: true,
          tenant: masterTenant,
          groups: [gUser],
        },
        {
          username: 'user2',
          email: 'user2@user2.com',
          ...tempUser.createPassword('12345678'),
          firstName: 'User2FirstName',
          lastName: 'User2LastName',
          isSuperuser: false,
          isStaff: false,
          isActive: true,
          tenant: masterTenant,
          groups: [gUser],
        },
        {
          username: 'user3',
          email: 'user3@user3.com',
          ...tempUser.createPassword('12345678'),
          firstName: 'User3FirstName',
          lastName: 'User3LastName',
          isSuperuser: false,
          isStaff: false,
          isActive: true,
          tenant: masterTenant,
          groups: [lUser],
        },
        {
          username: 'user4',
          email: 'user4@user4.com',
          ...tempUser.createPassword('12345678'),
          firstName: 'User4FirstName',
          lastName: 'User4LastName',
          isSuperuser: false,
          isStaff: false,
          isActive: false,
          tenant: masterTenant,
          groups: [gUser],
        },
        {
          username: 'user5',
          email: 'user5@user5.com',
          ...tempUser.createPassword('12345678'),
          firstName: 'User5FirstName',
          lastName: 'User5LastName',
          isSuperuser: false,
          isStaff: false,
          isActive: false,
          tenant: masterTenant,
          groups: [lUser],
        },
      ]),
    );
  }

  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
  public async down(_queryRunner: QueryRunner): Promise<any> {}
}
