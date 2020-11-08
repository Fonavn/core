import { Group } from '@lib/core/entities/group.entity';
import { Permission } from '@lib/core/entities/permission.entity';
import { User } from '@lib/core/entities/user.entity';
import { TenantEntity } from '@lib/tenant/tenant.entity';
import { plainToClass } from 'class-transformer';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class TenantSeed implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    const gAdmin = await queryRunner.manager
      .getRepository(Group)
      .findOneOrFail({
        where: {
          name: 'admin',
        },
      });
    const userTenant = await queryRunner.manager
      .getRepository<TenantEntity>(TenantEntity)
      .save(
        plainToClass(TenantEntity, {
          name: 'userTenant',
          path: 'userTenant',
          database: {
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'userTenant',
            password: 1,
            database: 'userTenant',
          },
        }),
      );
    const tempUser = new User();
    await queryRunner.manager.getRepository<User>(User).save(
      plainToClass(User, [
        {
          username: 'superTenant',
          email: 'superTenant@superTenant.com',
          ...tempUser.createPassword('12345678'),
          firstName: 'superTenantFirstName',
          lastName: 'superTenantLastName',
          isSuperuser: true,
          isStaff: false,
          isActive: true,
          tenant: userTenant,
          groups: [gAdmin],
        },
      ]),
    );
  }

  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
  public async down(_queryRunner: QueryRunner): Promise<any> {}
}
