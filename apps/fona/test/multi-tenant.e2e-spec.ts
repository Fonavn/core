import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnectionOptions,
} from 'typeorm';
import { AppModule } from './../src/app.module';
import { BaseSeed } from './seed/base.seed';
import * as faker from 'faker';

jest.setTimeout(10000);
describe('Multi-tenant test (e2e)', () => {
  let app;
  let user1, token1;
  let user2;
  const dbname1 = 'dbname1test';
  const dbname2 = 'dbname2test';
  let connectionOptions;
  // Create data
  let superToken;
  const pass = '12345678';

  beforeAll(async () => {
    // Get connection options
    connectionOptions = await getConnectionOptions('test');
  });

  beforeEach(async () => {
    // Master connection
    connectionOptions = {
      ...connectionOptions,
      name: 'manual',
      synchronize: true,
      dropSchema: true,
    };

    // Seed for master
    const baseSeed = new BaseSeed();
    const connection: Connection = await createConnection(connectionOptions);
    const queryRunner = await connection.createQueryRunner();
    await baseSeed.up(queryRunner);
    await connection.close();

    // clean tenant db
    const tenant1Connection: Connection = await createConnection({
      ...connectionOptions,
      database: dbname1,
    });
    await tenant1Connection.close();
    const tenant2Connection: Connection = await createConnection({
      ...connectionOptions,
      database: dbname1,
    });
    await tenant2Connection.close();

    // Application
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    const data = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        email: 'tenant1test@tenant1test.com',
        username: dbname1,
        password: '12345678',
      })
      .expect(201)
      .then(res => res.body);
    user1 = data.user;
    token1 = data.token;

    user2 = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        email: 'tenant2test@tenant2test.com',
        username: dbname2,
        password: '12345678',
      })
      .expect(201)
      .then(res => res.body.user);
    // frequency use
    superToken = await request(app.getHttpServer())
      .post('/api/auth/signin')
      .set('tnid', 'master')
      .send({
        email: 'super@super.com',
        password: pass,
      })
      .then(res => res.body.token);
  });

  describe('Init tenant on sign up', () => {
    it('Must return tenant info', async () => {
      const email = faker.internet.email();
      const username = faker.random.word();
      const password = faker.random.word();
      return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email,
          username,
          password,
        })
        .expect(201)
        .then(res => {
          expect(res.body.user.tenant).toBeDefined();
          expect(res.body.user.tenant.id).toBeDefined();
          expect(res.body.user.tenant.database).toBeUndefined();
          return request(app.getHttpServer())
            .get(`/api/admin/tenant/${res.body.user.tenant.id}`)
            .set('Authorization', `Bearer ${superToken}`)
            .expect(200)
            .then(res => {
              expect(res.body.id).toBeDefined();
            });
        });
    });
  });

  describe('Cannot set wrong header', () => {
    it('Cannot access admin route', () => {
      return request(app.getHttpServer())
        .get(`/api/admin/tenant/1`)
        .set('Authorization', `Bearer ${user1.token}`)
        .expect(403);
    });

    it('Cannot use other tenant-id', () => {
      return request(app.getHttpServer())
        .get(`/api/todo`)
        .set('tnid', dbname2)
        .set('Authorization', `Bearer ${user1.token}`)
        .expect(403);
    });
  });

  describe('Select correct database', () => {
    describe('Master database', () => {
      it('Use `User` table in master DB', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/users`)
          .set('Authorization', `Bearer ${superToken}`)
          .expect(200);
      });

      it('Use `Tenant` table in master DB', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/tenant`)
          .set('Authorization', `Bearer ${superToken}`)
          .expect(200);
      });

      it('Use `Database` table in master DB', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/database`)
          .set('Authorization', `Bearer ${superToken}`)
          .expect(200);
      });

      it('Use `Group` table in master DB', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/groups`)
          .set('Authorization', `Bearer ${superToken}`)
          .expect(200);
      });

      it('Use `Permission` table in master DB', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/permissions`)
          .set('Authorization', `Bearer ${superToken}`)
          .expect(200);
      });

      it('Use `ContentType` table in master DB', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/content_types`)
          .set('Authorization', `Bearer ${superToken}`)
          .expect(200);
      });

      it('Use tenant database', () => {
        return request(app.getHttpServer())
          .get(`/api/admin/tenant`)
          .set('Authorization', `Bearer ${superToken}`)
          .expect(200);
      });
    });

    describe('Use todo of tenant database', () => {
      it('Should return tenant todos', async () => {
        const title = faker.random.word();
        const completed = faker.random.boolean();

        await request(app.getHttpServer())
          .post(`/api/todo`)
          .set('tnid', dbname1)
          .set('Authorization', `Bearer ${token1}`)
          .send({
            title,
            completed,
          })
          .expect(201);

        await request(app.getHttpServer())
          .get(`/api/todo/1`)
          .set('tnid', dbname1)
          .set('Authorization', `Bearer ${token1}`)
          .expect(200)
          .then(res => {
            expect(res.body.id).toBe(1);
            expect(res.body.completed).toBe(completed);
          });
      });

      it('Should not return todos if use other tenant-id', () => {
        return request(app.getHttpServer())
          .get(`/api/todo`)
          .set('tnid', dbname2)
          .set('Authorization', `Bearer ${token1}`)
          .expect(403);
      });
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
