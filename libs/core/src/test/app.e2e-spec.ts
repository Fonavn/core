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
  ConnectionOptions,
  getConnection,
  getConnectionOptions,
} from 'typeorm';
import { CORE_CONFIG_TOKEN, DEFAULT_CORE_CONFIG } from '../configs/core.config';
import { CoreModule } from '../core.module';
import * as winston from 'winston';
import { PassportModule } from '@nestjs/passport';
import assert from 'assert';

describe('AccountController (e2e)', () => {
  let app;
  let connectionOptions: ConnectionOptions;
  // Create data
  const admin = 'admin@admin.com';
  const user1 = 'user1@user1.com';
  const user2 = 'user2@user2.com';
  const pass = '12345678';

  beforeAll(async () => {
    // Get connection options
    connectionOptions = await getConnectionOptions('test');
    connectionOptions = {
      ...connectionOptions,
      name: 'default',
      migrationsRun: true,
    };

    // Create server
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        WinstonModule.forRoot({
          level: 'info',
          format: winston.format.json(),
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
            useFactory: () => ({ ...DEFAULT_CORE_CONFIG }),
            imports: [],
          },
        ),
        TenantModule.forRoot([]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');

    await app.init();
  });

  beforeEach(async () => {
    // empty
  });

  it('/ (POST) 403', () => {
    return request(app.getHttpServer())
      .post('/api/admin/account/update')
      .expect(403);
  });

  it('/ (POST) 200', () => {
    return request(app.getHttpServer())
      .post('/api/auth/signin')
      .set('tnid', 'master')
      .send({
        email: admin,
        password: pass,
      })
      .expect(200)
      .then(res => {
        const token = res.body.token;
        return request(app.getHttpServer())
          .post('/api/admin/account/update')
          .set('tnid', 'master')
          .set('Authorization', `JWT ${token}`)
          .send({
            email: admin,
            username: 'admin',
            password: pass,
            firstName: 'test',
            lastName: 'test',
          })
          .expect(200)
          .then(res => {
            expect(res.body.user.email).toBe(admin);
            expect(res.body.user.username).toBe('admin');
            expect(res.body.user.firstName).toBe('test');
            expect(res.body.user.lastName).toBe('test');
          });
      });
  });
});
