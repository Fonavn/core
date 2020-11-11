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
import {
  CoreModule,
  CORE_CONFIG_TOKEN,
  DEFAULT_CORE_CONFIG,
  InCreateUserDto,
} from '@lib/core';
import { InDatabaseDto } from '../databases/dto/in-database.dto';
import { InUpdateDatabaseDto } from '../databases/dto/in-update-database.dto';
import { DatabaseEntity } from '../databases/databases.entity';
import { DatabaseSeed } from './seed/database.seed';
import { SendGridModule } from '@ntegral/nestjs-sendgrid';
import { MailModule } from '@lib/mail';

jest.setTimeout(10000);
describe('Database (e2e)', () => {
  let app;
  let connectionOptions: ConnectionOptions;
  // Create data
  let adminToken;
  let staffToken;
  let adminInactiveToken;
  let superToken;
  const pass = '12345678';
  let sendGridServiceSpy: any;

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
    const databaseSeed = new DatabaseSeed();
    const connection: Connection = await createConnection(connectionOptions);
    const queryRunner = await connection.createQueryRunner();
    await baseSeed.up(queryRunner);
    await databaseSeed.up(queryRunner);
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
        MailModule.forRootAsync(
          {
            imports: [],
            useFactory: () => ({
              apiKey: 'SG.dummykey',
            }),
          },
          {
            imports: [],
            useFactory: () => ({
              from: faker.internet.email(),
              verifyHost: faker.internet.url(),
              templates: {
                confirm: faker.random.alphaNumeric(10),
                forgetPassword: faker.random.alphaNumeric(10),
                passwordChanged: faker.random.alphaNumeric(10),
              },
            }),
          },
        ),
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
    const sendGridService = moduleFixture.get('SendGridToken');
    app.setGlobalPrefix('api');

    await app.init();

    // mock
    sendGridServiceSpy = jest
      .spyOn(sendGridService, 'send')
      .mockImplementation();

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

  describe('Add database', () => {
    describe('Authenticated', () => {
      it('/ (POST) 201 super user can create database', () => {
        const host = faker.random.alphaNumeric(10);
        const port = faker.random.number();
        const username = faker.random.alphaNumeric(10);
        const password = faker.random.alphaNumeric(10);
        const database = faker.random.alphaNumeric(10);
        return request(app.getHttpServer())
          .post('/api/admin/databases')
          .set('Authorization', `JWT ${superToken}`)
          .send({
            type: 'postgres',
            host,
            port,
            username,
            password,
            database,
          } as InDatabaseDto)
          .expect(201)
          .then(res => {
            expect(res.body.type).toBe('postgres');
            expect(res.body.host).toBe(host);
            expect(res.body.port).toBe(port);
            expect(res.body.username).toBe(username);
            expect(res.body.password).toBe(password);
            expect(res.body.database).toBe(database);
          });
      });
    });

    describe('Unauthenticated', () => {
      it('/ (POST) 403 admin user cannot create database', () => {
        const host = faker.random.alphaNumeric(10);
        const port = faker.random.number();
        const username = faker.random.alphaNumeric(10);
        const password = faker.random.alphaNumeric(10);
        const database = faker.random.alphaNumeric(10);
        return request(app.getHttpServer())
          .post('/api/admin/databases')
          .set('Authorization', `JWT ${adminToken}`)
          .send({
            type: 'postgres',
            host,
            port,
            username,
            password,
            database,
          } as InDatabaseDto)
          .expect(403);
      });

      it('/ (POST) 403 inactive admin user cannot create database', () => {
        const host = faker.random.alphaNumeric(10);
        const port = faker.random.number();
        const username = faker.random.alphaNumeric(10);
        const password = faker.random.alphaNumeric(10);
        const database = faker.random.alphaNumeric(10);
        return request(app.getHttpServer())
          .post('/api/admin/databases')
          .set('Authorization', `JWT ${adminInactiveToken}`)
          .send({
            type: 'postgres',
            host,
            port,
            username,
            password,
            database,
          } as InDatabaseDto)
          .expect(403);
      });

      it('/ (POST) 403 staff user with permission cannot create database', () => {
        const host = faker.random.alphaNumeric(10);
        const port = faker.random.number();
        const username = faker.random.alphaNumeric(10);
        const password = faker.random.alphaNumeric(10);
        const database = faker.random.alphaNumeric(10);
        return request(app.getHttpServer())
          .post('/api/auth/signin')
          .send({
            email: 'addDatabaseUser@addDatabaseUser.com',
            password: pass,
          })
          .then(res => {
            return request(app.getHttpServer())
              .post('/api/admin/databases')
              .set('Authorization', `JWT ${res.body.token}`)
              .send({
                type: 'postgres',
                host,
                port,
                username,
                password,
                database,
              } as InDatabaseDto)
              .expect(403);
          });
      });

      it('/ (POST) 403 guest user cannot create database', () => {
        return request(app.getHttpServer())
          .post('/api/admin/databases')
          .expect(403);
      });

      it('/ (POST) 403 general user cannot create database', () => {
        return request(app.getHttpServer())
          .post('/api/admin/databases')
          .set('Authorization', `JWT ${staffToken}`)
          .send({
            name: faker.name.firstName(),
          })
          .expect(403);
      });
    });
  });

  describe('Change database', () => {
    let database: DatabaseEntity;
    beforeEach(async () => {
      const host = faker.random.alphaNumeric(10);
      const port = faker.random.number();
      const username = faker.random.alphaNumeric(10);
      const password = faker.random.alphaNumeric(10);
      const db = faker.random.alphaNumeric(10);
      database = await request(app.getHttpServer())
        .post('/api/admin/databases')
        .set('Authorization', `JWT ${superToken}`)
        .send({
          type: 'postgres',
          host,
          port,
          username,
          password,
          database: db,
        } as InDatabaseDto)
        .expect(201)
        .then(res => {
          return res.body;
        });
    });

    describe('Authenticated', () => {
      it('/ (PATCH) 200 super user can change database', () => {
        const username = faker.random.alphaNumeric(10);
        return request(app.getHttpServer())
          .patch(`/api/admin/databases/${database.id}`)
          .set('Authorization', `JWT ${superToken}`)
          .send({
            username,
          } as InUpdateDatabaseDto)
          .expect(200)
          .then(res => {
            expect(res.body.username).toBe(username);
          });
      });
    });

    describe('Unauthenticated', () => {
      it('/ (PATCH) 403 admin user cannot change database', () => {
        const username = faker.random.alphaNumeric(10);

        return request(app.getHttpServer())
          .patch(`/api/admin/databases/${database.id}`)
          .set('Authorization', `JWT ${adminToken}`)
          .send({
            username,
          } as InUpdateDatabaseDto)
          .expect(403);
      });

      it('/ (PATCH) 403 inactive admin user cannot change database', () => {
        const username = faker.random.alphaNumeric(10);

        return request(app.getHttpServer())
          .patch(`/api/admin/databases/${database.id}`)
          .set('Authorization', `JWT ${adminInactiveToken}`)
          .send({
            username,
          } as InUpdateDatabaseDto)
          .expect(403);
      });

      it('/ (PATCH) 403 staff user with permission cannot change user', () => {
        return request(app.getHttpServer())
          .post('/api/auth/signin')
          .send({
            email: 'changeDatabaseUser@changeDatabaseUser.com',
            password: pass,
          })
          .expect(200)
          .then(res => {
            const username = faker.random.alphaNumeric(10);

            return request(app.getHttpServer())
              .patch(`/api/admin/databases/${database.id}`)
              .set('Authorization', `JWT ${adminInactiveToken}`)
              .send({
                username,
              } as InUpdateDatabaseDto)
              .expect(403);
          });
      });

      it('/ (PATCH) 403 guest user cannot change user', () => {
        return request(app.getHttpServer())
          .patch('/api/admin/databases/3')
          .send({
            name: faker.name.firstName(),
            title: faker.random.alphaNumeric(10),
          })
          .expect(403);
      });

      it('/ (PATCH) 403 general user cannot change user', () => {
        return request(app.getHttpServer())
          .patch('/api/admin/databases/3')
          .set('Authorization', `JWT ${staffToken}`)
          .send({
            name: faker.name.firstName(),
            title: faker.random.alphaNumeric(10),
          })
          .expect(403);
      });
    });
  });

  describe('Delete database', () => {
    describe('Authenticated', () => {
      let database: DatabaseEntity;
      beforeEach(async () => {
        const host = faker.random.alphaNumeric(10);
        const port = faker.random.number();
        const username = faker.random.alphaNumeric(10);
        const password = faker.random.alphaNumeric(10);
        const db = faker.random.alphaNumeric(10);
        database = await request(app.getHttpServer())
          .post('/api/admin/databases')
          .set('Authorization', `JWT ${superToken}`)
          .send({
            type: 'postgres',
            host,
            port,
            username,
            password,
            database: db,
          } as InDatabaseDto)
          .expect(201)
          .then(res => {
            return res.body;
          });
      });

      it('/ (DELETE) 204 super user can delete database', () => {
        return request(app.getHttpServer())
          .delete(`/api/admin/databases/${database.id}`)
          .set('Authorization', `JWT ${superToken}`)
          .expect(200)
          .then(res => {
            return request(app.getHttpServer())
              .get(`/api/admin/databases/${database.id}`)
              .set('Authorization', `JWT ${superToken}`)
              .expect(404);
          });
      });
    });

    describe('Unauthenticated', () => {
      it('/ (DELETE) 403 admin user cannot delete database', () => {
        return request(app.getHttpServer())
          .delete(`/api/admin/databases/3`)
          .set('Authorization', `JWT ${adminToken}`)
          .expect(403);
      });

      it('/ (DELETE) 403 inactive admin user cannot delete database', () => {
        return request(app.getHttpServer())
          .delete(`/api/admin/databases/3`)
          .set('Authorization', `JWT ${adminInactiveToken}`)
          .expect(403);
      });

      it('/ (DELETE) 403 staff user with permission cannot delete database', () => {
        return request(app.getHttpServer())
          .post('/api/auth/signin')
          .send({
            email: 'deleteDatabaseUser@deleteDatabaseUser.com',
            password: pass,
          })
          .expect(200)
          .then(res => {
            return request(app.getHttpServer())
              .delete(`/api/admin/databases/3`)
              .set('Authorization', `JWT ${res.body.token}`)
              .expect(403);
          });
      });

      it('/ (DELETE) 403 guest user cannot delete database', () => {
        return request(app.getHttpServer())
          .delete('/api/admin/databases/3')
          .expect(403);
      });

      it('/ (DELETE) 403 general user cannot delete database', () => {
        return request(app.getHttpServer())
          .delete('/api/admin/databases/3')
          .set('Authorization', `JWT ${staffToken}`)
          .expect(403);
      });
    });
  });

  describe('Read database', () => {
    describe('Authenticated', () => {
      it('/ (GET) 200 super user can read database', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/databases/1`)
          .set('Authorization', `JWT ${superToken}`)
          .expect(200)
          .then(res => {
            expect(res.body.id).toBe(1);
            expect(res.body.type).toBeDefined();
            expect(res.body.host).toBeDefined();
            expect(res.body.port).toBeDefined();
            expect(res.body.username).toBeDefined();
            expect(res.body.password).toBeDefined();
            expect(res.body.database).toBeDefined();
          });
      });
    });

    describe('Unauthenticated', () => {
      it('/ (GET) 403 admin user cannot read database', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/databases/1`)
          .set('Authorization', `JWT ${adminToken}`)
          .expect(403);
      });

      it('/ (GET) 403 inactive admin user cannot read database', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/databases/1`)
          .set('Authorization', `JWT ${adminInactiveToken}`)
          .expect(403);
      });

      it('/ (GET) 403 staff user with permission cannot read database', () => {
        return request(app.getHttpServer())
          .post('/api/auth/signin')
          .send({
            email: 'readDatabaseUser@readDatabaseUser.com',
            password: pass,
          })
          .expect(200)
          .then(res => {
            return request(app.getHttpServer())
              .get(`/api/admin/databases/1`)
              .set('Authorization', `JWT ${res.body.token}`)
              .expect(403);
          });
      });

      it('/ (GET) 403 guest user cannot read database', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/databases/1`)
          .expect(403);
      });

      it('/ (GET) 403 general user cannot read database', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/databases/1`)
          .set('Authorization', `JWT ${staffToken}`)
          .expect(403);
      });
    });
  });

  describe('Read databases', () => {
    describe('Authenticated', () => {
      it('/ (GET) 200 super user can read databases', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/databases`)
          .set('Authorization', `JWT ${superToken}`)
          .expect(200)
          .then(res => {
            expect(res.body).toBeDefined();
            expect(res.body[0]).toBeDefined();
            expect(res.body[0].id).toBe(1);
            expect(res.body[0].type).toBeDefined();
            expect(res.body[0].host).toBeDefined();
            expect(res.body[0].port).toBeDefined();
            expect(res.body[0].username).toBeDefined();
            expect(res.body[0].password).toBeDefined();
            expect(res.body[0].database).toBeDefined();
          });
      });
    });

    describe('Unauthenticated', () => {
      it('/ (GET) 403 admin user cannot read databases', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/databases`)
          .set('Authorization', `JWT ${adminToken}`)
          .expect(403);
      });

      it('/ (GET) 403 inactive admin user cannot read databases', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/databases`)
          .set('Authorization', `JWT ${adminInactiveToken}`)
          .expect(403);
      });

      it('/ (GET) 403 staff user with permission cannot read database', () => {
        return request(app.getHttpServer())
          .post('/api/auth/signin')
          .send({
            email: 'readDatabaseUser@readDatabaseUser.com',
            password: pass,
          })
          .expect(200)
          .then(res => {
            return request(app.getHttpServer())
              .get(`/api/admin/databases`)
              .set('Authorization', `JWT ${adminInactiveToken}`)
              .expect(403);
          });
      });

      it('/ (GET) 403 guest user cannot read user', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/databases`)
          .expect(403);
      });

      it('/ (GET) 403 general user cannot read user', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/databases`)
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
