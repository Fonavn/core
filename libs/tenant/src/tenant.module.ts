import {
  BadRequestException,
  MiddlewareConsumer,
  Module,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TENANT_CONNECTION, TENANT_ID_HEADER } from './const';
import { DatabaseModule } from './database/database.module';
import { TenantEntity } from './tenant.entity';
import { Connection, createConnection, getConnection } from 'typeorm';
import { TodoEntity } from 'apps/fona/src/todo/todo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity]), DatabaseModule],
  providers: [
    {
      provide: TENANT_CONNECTION,
      inject: [REQUEST, Connection],
      scope: Scope.REQUEST,
      useFactory: async (request, connection) => {
        const tenant: TenantEntity = await connection
          .getRepository(TenantEntity)
          .findOne({ where: { path: request.headers[TENANT_ID_HEADER] } });

        return getConnection(tenant.path);
      },
    },
  ],
  exports: [TENANT_CONNECTION],
})
export class TenantModule {
  constructor(private readonly connection: Connection) {}

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(async (req, res, next) => {
        const tenant: TenantEntity = await this.connection
          // TODO for future use host now use tenantId
          // .getRepository(TenantEntity).findOne(({ relations: ['database'], where: { host: req.headers.host } }));
          .getRepository(TenantEntity)
          .findOne({
            relations: ['database'],
            where: { path: req.headers[TENANT_ID_HEADER] },
          });

        if (!tenant) {
          throw new BadRequestException(
            'Database Connection Error',
            'There is a Error with the Database!',
          );
        }
        const database = tenant.database;
        if (!database) {
          throw new BadRequestException(
            'Database Connection Error',
            'There is a Error with the tenant Database!',
          );
        }

        try {
          getConnection(tenant.path);
          next();
        } catch (e) {
          // TODO fallback to current hostname
          const createdConnection: Connection | void = await createConnection({
            name: tenant.path,
            type: database.type as any,
            host: database.host,
            port: database.port,
            username: database.username,
            password: database.password,
            database: database.database,
            // TODO inject
            entities: [TodoEntity],
            synchronize: true,
          });

          if (createdConnection) {
            next();
          } else {
            throw new BadRequestException(
              'Database Connection Error',
              'There is a Error with the Database!',
            );
          }
        }
      })
      .forRoutes('api');
  }
}
