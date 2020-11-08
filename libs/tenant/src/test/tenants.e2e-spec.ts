import {
  AuthModule,
  DEFAULT_FACEBOOK_CONFIG,
  DEFAULT_GOOGLE_PLUS_CONFIG,
  DEFAULT_JWT_CONFIG,
} from '@lib/auth';
import { TenantModule } from '@lib/tenant';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import * as request from 'supertest';
import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnectionOptions,
} from 'typeorm';
import * as winston from 'winston';
import { PassportModule } from '@nestjs/passport';
import { BaseSeed } from './seed/base.seed';
import * as faker from 'faker';
import { Console } from 'winston/lib/winston/transports';
import adminRoutes from '@app/fona/config/admin-route';
import { DEFAULT_AUTH_CORE_CONFIG } from '@lib/auth/configs/core.config';
import { CoreModule, CORE_CONFIG_TOKEN, DEFAULT_CORE_CONFIG } from '@lib/core';
import { TenantSeed } from './seed/tenant.seed';
import { TenantEntity } from '../tenant.entity';
import { InUpdateTenantDto } from '../dto/in-update-tenant.dto';
import { InTenantDto } from '../dto/in-tenant.dto';
import { InDatabaseDto } from '../databases/dto/in-database.dto';

jest.setTimeout(10000);
describe('Tenant (e2e)', () => {
  let app;
  let connectionOptions: ConnectionOptions;
  // Create data
  let adminToken;
  let staffToken;
  let adminInactiveToken;
  let superToken;
  const pass = '12345678';

  beforeAll(async () => {
    // Get connection options
    connectionOptions = await getConnectionOptions('test');
  });

  beforeEach(async () => {
    connectionOptions = {
      ...connectionOptions,
      name: 'default',
      synchronize: true,
      dropSchema: true,
    };

    const baseSeed = new BaseSeed();
    const tenantSeed = new TenantSeed();
    const connection: Connection = await createConnection(connectionOptions);
    const queryRunner = await connection.createQueryRunner();
    await baseSeed.up(queryRunner);
    await tenantSeed.up(queryRunner);
    await connection.close();

    connectionOptions = {
      ...connectionOptions,
      name: 'default',
      synchronize: false,
      dropSchema: false,
    };

    // Create server
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        WinstonModule.forRoot({
          level: 'info',
          format: winston.format.json(),
          transports: [new Console()],
        }),
        TypeOrmModule.forRoot(connectionOptions),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        CoreModule.forRoot({
          providers: [
            {
              provide: CORE_CONFIG_TOKEN,
              useValue: {
                ...DEFAULT_CORE_CONFIG,
              },
            },
          ],
        }),
        AuthModule.forRootAsync(
          {
            useFactory: () => ({
              ...DEFAULT_FACEBOOK_CONFIG,
              client_id: 'test',
              client_secret: 'test',
              oauth_redirect_uri: 'test',
            }),
            imports: [],
          },
          {
            useFactory: () => ({ ...DEFAULT_GOOGLE_PLUS_CONFIG }),
            imports: [],
          },
          {
            useFactory: () => ({ ...DEFAULT_JWT_CONFIG }),
            imports: [],
          },
          {
            useFactory: () => ({ ...DEFAULT_AUTH_CORE_CONFIG }),
            imports: [],
          },
        ),
        TenantModule.forRoot([], adminRoutes),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');

    await app.init();

    // frequency use
    superToken = await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({
        email: 'super@super.com',
        password: pass,
      })
      .then(res => res.body.token);
    adminToken = await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({
        email: 'admin@admin.com',
        password: pass,
      })
      .then(res => res.body.token);
    staffToken = await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({
        email: 'user1@user1.com',
        password: pass,
      })
      .then(res => res.body.token);
    adminInactiveToken = await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({
        email: 'inactiveAdmin@inactiveAdmin.com',
        password: pass,
      })
      .then(res => res.body.token);
  });

  describe('Add tenant', () => {
    describe('Authenticated', () => {
      it('/ (POST) 201 super user can create tenant', () => {
        const path = faker.random.alphaNumeric(10);
        const host = faker.random.alphaNumeric(10);
        const name = faker.random.alphaNumeric(10);
        const description = faker.random.word();
        return request(app.getHttpServer())
          .post('/api/admin/tenants')
          .set('Authorization', `JWT ${superToken}`)
          .send({
            path,
            host,
            name,
            description,
            database: {
              type: 'postgres',
              host: faker.random.alphaNumeric(10),
              port: faker.random.number(),
              password: faker.random.alphaNumeric(10),
              username: faker.random.alphaNumeric(10),
              database: faker.random.alphaNumeric(10),
            } as InDatabaseDto,
          } as InTenantDto)
          .expect(201)
          .then(res => {
            expect(res.body.path).toBe(path);
            expect(res.body.host).toBe(host);
            expect(res.body.name).toBe(name);
            expect(res.body.description).toBe(description);
            expect(res.body.database).toBeDefined();
          });
      });
    });

    describe('Unauthenticated', () => {
      it('/ (POST) 403 admin user cannot create tenant', () => {
        const path = faker.random.alphaNumeric(10);
        const host = faker.random.alphaNumeric(10);
        const name = faker.random.alphaNumeric(10);
        const description = faker.random.word();
        return request(app.getHttpServer())
          .post('/api/admin/tenants')
          .set('Authorization', `JWT ${adminToken}`)
          .send({
            path,
            host,
            name,
            description,
            database: {
              type: 'postgres',
              host: faker.random.alphaNumeric(10),
              port: faker.random.number(),
              password: faker.random.alphaNumeric(10),
              username: faker.random.alphaNumeric(10),
              database: faker.random.alphaNumeric(10),
            } as InDatabaseDto,
          } as InTenantDto)
          .expect(403);
      });

      it('/ (POST) 403 inactive admin user cannot create tenant', () => {
        const path = faker.random.alphaNumeric(10);
        const host = faker.random.alphaNumeric(10);
        const name = faker.random.alphaNumeric(10);
        const description = faker.random.word();
        return request(app.getHttpServer())
          .post('/api/admin/tenants')
          .set('Authorization', `JWT ${adminInactiveToken}`)
          .send({
            path,
            host,
            name,
            description,
            database: {
              type: 'postgres',
              host: faker.random.alphaNumeric(10),
              port: faker.random.number(),
              password: faker.random.alphaNumeric(10),
              username: faker.random.alphaNumeric(10),
              database: faker.random.alphaNumeric(10),
            } as InDatabaseDto,
          } as InTenantDto)
          .expect(403);
      });

      it('/ (POST) 403 staff user with permission cannot create tenant', () => {
        const path = faker.random.alphaNumeric(10);
        const host = faker.random.alphaNumeric(10);
        const name = faker.random.alphaNumeric(10);
        const description = faker.random.word();
        return request(app.getHttpServer())
          .post('/api/auth/signin')
          .send({
            email: 'addTenantUser@addTenantUser.com',
            password: pass,
          })
          .then(res => {
            return request(app.getHttpServer())
              .post('/api/admin/tenants')
              .set('Authorization', `JWT ${res.body.token}`)
              .send({
                path,
                host,
                name,
                description,
                database: {
                  type: 'postgres',
                  host: faker.random.alphaNumeric(10),
                  port: faker.random.number(),
                  password: faker.random.alphaNumeric(10),
                  username: faker.random.alphaNumeric(10),
                  database: faker.random.alphaNumeric(10),
                } as InDatabaseDto,
              } as InTenantDto)
              .expect(403);
          });
      });

      it('/ (POST) 403 guest user cannot create tenant', () => {
        return request(app.getHttpServer())
          .post('/api/admin/tenants')
          .expect(403);
      });

      it('/ (POST) 403 general user cannot create tenant', () => {
        return request(app.getHttpServer())
          .post('/api/admin/tenants')
          .set('Authorization', `JWT ${staffToken}`)
          .send({
            name: faker.name.firstName(),
          })
          .expect(403);
      });
    });
  });

  describe('Change tenant', () => {
    let tenant: TenantEntity;
    beforeEach(async () => {
      const path = faker.random.alphaNumeric(10);
      const host = faker.random.alphaNumeric(10);
      const name = faker.random.alphaNumeric(10);
      const description = faker.random.word();
      tenant = await request(app.getHttpServer())
        .post('/api/admin/tenants')
        .set('Authorization', `JWT ${superToken}`)
        .send({
          path,
          host,
          name,
          description,
          database: {
            type: 'postgres',
            host: faker.random.alphaNumeric(10),
            port: faker.random.number(),
            password: faker.random.alphaNumeric(10),
            username: faker.random.alphaNumeric(10),
            database: faker.random.alphaNumeric(10),
          } as InDatabaseDto,
        } as InTenantDto)
        .expect(201)
        .then(res => {
          return res.body;
        });
    });

    describe('Authenticated', () => {
      it('/ (PATCH) 200 super user can change tenant', () => {
        const host = faker.random.alphaNumeric(10);
        return request(app.getHttpServer())
          .patch(`/api/admin/tenants/${tenant.id}`)
          .set('Authorization', `JWT ${superToken}`)
          .send({
            host,
          } as InUpdateTenantDto)
          .expect(200)
          .then(res => {
            expect(res.body.host).toBe(host);
          });
      });
    });

    describe('Unauthenticated', () => {
      it('/ (PATCH) 403 admin user cannot change tenant', () => {
        const host = faker.random.alphaNumeric(10);

        return request(app.getHttpServer())
          .patch(`/api/admin/tenants/${tenant.id}`)
          .set('Authorization', `JWT ${adminToken}`)
          .send({
            host,
          } as InUpdateTenantDto)
          .expect(403);
      });

      it('/ (PATCH) 403 inactive admin user cannot change tenant', () => {
        const host = faker.random.alphaNumeric(10);

        return request(app.getHttpServer())
          .patch(`/api/admin/tenants/${tenant.id}`)
          .set('Authorization', `JWT ${adminInactiveToken}`)
          .send({
            host,
          } as InUpdateTenantDto)
          .expect(403);
      });

      it('/ (PATCH) 403 staff user with permission cannot change user', () => {
        return request(app.getHttpServer())
          .post('/api/auth/signin')
          .send({
            email: 'changeTenantUser@changeTenantUser.com',
            password: pass,
          })
          .expect(200)
          .then(res => {
            const host = faker.random.alphaNumeric(10);

            return request(app.getHttpServer())
              .patch(`/api/admin/tenants/${tenant.id}`)
              .set('Authorization', `JWT ${adminInactiveToken}`)
              .send({
                host,
              } as InUpdateTenantDto)
              .expect(403);
          });
      });

      it('/ (PATCH) 403 guest user cannot change user', () => {
        return request(app.getHttpServer())
          .patch('/api/admin/tenants/3')
          .send({
            host: faker.random.alphaNumeric(10),
          })
          .expect(403);
      });

      it('/ (PATCH) 403 general user cannot change user', () => {
        return request(app.getHttpServer())
          .patch('/api/admin/tenants/3')
          .set('Authorization', `JWT ${staffToken}`)
          .send({
            host: faker.random.alphaNumeric(10),
          })
          .expect(403);
      });
    });
  });

  describe('Delete tenant', () => {
    describe('Authenticated', () => {
      let tenant: TenantEntity;
      beforeEach(async () => {
        const path = faker.random.alphaNumeric(10);
        const host = faker.random.alphaNumeric(10);
        const name = faker.random.alphaNumeric(10);
        const description = faker.random.word();
        tenant = await request(app.getHttpServer())
          .post('/api/admin/tenants')
          .set('Authorization', `JWT ${superToken}`)
          .send({
            path,
            host,
            name,
            description,
            database: {
              type: 'postgres',
              host: faker.random.alphaNumeric(10),
              port: faker.random.number(),
              password: faker.random.alphaNumeric(10),
              username: faker.random.alphaNumeric(10),
              database: faker.random.alphaNumeric(10),
            } as InDatabaseDto,
          } as InTenantDto)
          .expect(201)
          .then(res => {
            return res.body;
          });
      });

      it('/ (DELETE) 204 super user can delete tenant', () => {
        return request(app.getHttpServer())
          .delete(`/api/admin/tenants/${tenant.id}`)
          .set('Authorization', `JWT ${superToken}`)
          .expect(200)
          .then(res => {
            return request(app.getHttpServer())
              .get(`/api/admin/tenants/${tenant.id}`)
              .set('Authorization', `JWT ${superToken}`)
              .expect(404);
          });
      });
    });

    describe('Unauthenticated', () => {
      it('/ (DELETE) 403 admin user cannot delete tenant', () => {
        return request(app.getHttpServer())
          .delete(`/api/admin/tenants/3`)
          .set('Authorization', `JWT ${adminToken}`)
          .expect(403);
      });

      it('/ (DELETE) 403 inactive admin user cannot delete tenant', () => {
        return request(app.getHttpServer())
          .delete(`/api/admin/tenants/3`)
          .set('Authorization', `JWT ${adminInactiveToken}`)
          .expect(403);
      });

      it('/ (DELETE) 403 staff user with permission cannot delete tenant', () => {
        return request(app.getHttpServer())
          .post('/api/auth/signin')
          .send({
            email: 'deleteTenantUser@deleteTenantUser.com',
            password: pass,
          })
          .expect(200)
          .then(res => {
            return request(app.getHttpServer())
              .delete(`/api/admin/tenants/3`)
              .set('Authorization', `JWT ${res.body.token}`)
              .expect(403);
          });
      });

      it('/ (DELETE) 403 guest user cannot delete tenant', () => {
        return request(app.getHttpServer())
          .delete('/api/admin/tenants/3')
          .expect(403);
      });

      it('/ (DELETE) 403 general user cannot delete tenant', () => {
        return request(app.getHttpServer())
          .delete('/api/admin/tenants/3')
          .set('Authorization', `JWT ${staffToken}`)
          .expect(403);
      });
    });
  });

  describe('Read tenant', () => {
    describe('Authenticated', () => {
      it('/ (GET) 200 super user can read tenant', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/tenants/1`)
          .set('Authorization', `JWT ${superToken}`)
          .expect(200)
          .then(res => {
            expect(res.body.id).toBe(1);
            expect(res.body.path).toBeDefined();
            expect(res.body.host).toBeDefined();
            expect(res.body.description).toBeDefined();
            expect(res.body.database).toBeDefined();
          });
      });
    });

    describe('Unauthenticated', () => {
      it('/ (GET) 403 admin user cannot read tenant', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/tenants/1`)
          .set('Authorization', `JWT ${adminToken}`)
          .expect(403);
      });

      it('/ (GET) 403 inactive admin user cannot read tenant', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/tenants/1`)
          .set('Authorization', `JWT ${adminInactiveToken}`)
          .expect(403);
      });

      it('/ (GET) 403 staff user with permission cannot read tenant', () => {
        return request(app.getHttpServer())
          .post('/api/auth/signin')
          .send({
            email: 'readTenantUser@readTenantUser.com',
            password: pass,
          })
          .expect(200)
          .then(res => {
            return request(app.getHttpServer())
              .get(`/api/admin/tenants/1`)
              .set('Authorization', `JWT ${res.body.token}`)
              .expect(403);
          });
      });

      it('/ (GET) 403 guest user cannot read tenant', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/tenants/1`)
          .expect(403);
      });

      it('/ (GET) 403 general user cannot read tenant', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/tenants/1`)
          .set('Authorization', `JWT ${staffToken}`)
          .expect(403);
      });
    });
  });

  describe('Read tenants', () => {
    describe('Authenticated', () => {
      it('/ (GET) 200 super user can read tenants', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/tenants`)
          .set('Authorization', `JWT ${superToken}`)
          .expect(200)
          .then(res => {
            expect(res.body).toBeDefined();
            expect(res.body[0]).toBeDefined();
            expect(res.body[0].id).toBe(1);
            expect(res.body[0].path).toBeDefined();
            expect(res.body[0].host).toBeDefined();
            expect(res.body[0].name).toBeDefined();
            expect(res.body[0].description).toBeDefined();
            expect(res.body[0].database).toBeDefined();
          });
      });
    });

    describe('Unauthenticated', () => {
      it('/ (GET) 403 admin user cannot read tenants', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/tenants`)
          .set('Authorization', `JWT ${adminToken}`)
          .expect(403);
      });

      it('/ (GET) 403 inactive admin user cannot read tenants', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/tenants`)
          .set('Authorization', `JWT ${adminInactiveToken}`)
          .expect(403);
      });

      it('/ (GET) 403 staff user with permission cannot read tenant', () => {
        return request(app.getHttpServer())
          .post('/api/auth/signin')
          .send({
            email: 'readTenantUser@readTenantUser.com',
            password: pass,
          })
          .expect(200)
          .then(res => {
            return request(app.getHttpServer())
              .get(`/api/admin/tenants`)
              .set('Authorization', `JWT ${adminInactiveToken}`)
              .expect(403);
          });
      });

      it('/ (GET) 403 guest user cannot read user', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/tenants`)
          .expect(403);
      });

      it('/ (GET) 403 general user cannot read user', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/tenants`)
          .set('Authorization', `JWT ${staffToken}`)
          .expect(403);
      });
    });
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    // Empty
  });
});
