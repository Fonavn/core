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
import { CoreModule, CORE_CONFIG_TOKEN, DEFAULT_CORE_CONFIG } from '@lib/core';
import adminRoutes from '@app/fona/config/admin-route';
import { DEFAULT_AUTH_CORE_CONFIG } from '../configs/core.config';
import { SendGridModule } from '@ntegral/nestjs-sendgrid';
import { MailModule } from '@lib/mail';

jest.setTimeout(10000);
describe('User (e2e)', () => {
  let app;
  let connectionOptions: ConnectionOptions;
  let sendGridServiceSpy: any;
  // Create data
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
    const connection: Connection = await createConnection(connectionOptions);
    const queryRunner = await connection.createQueryRunner();
    await baseSeed.up(queryRunner);
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
      .set('tnid', 'master')
      .send({
        email: 'super@super.com',
        password: pass,
      })
      .then(res => res.body.token);
  });

  describe('Sign in', () => {
    describe('Sign in by email', () => {
      it('/ (POST) can sign in', () => {
        return request(app.getHttpServer())
          .post('/api/auth/signin')
          .send({
            email: 'admin@admin.com',
            password: pass,
          })
          .expect(200)
          .then(res => {
            expect(res.body.user).toBeDefined();
            expect(res.body.user.id).toBeDefined();
            expect(res.body.user.username).toBeDefined();
            expect(res.body.user.firstName).toBeDefined();
            expect(res.body.user.lastName).toBeDefined();
            expect(res.body.user.email).toBeDefined();
            // Should not included
            expect(res.body.user.salt).toBeUndefined();
            expect(res.body.user.confirmCode).toBeUndefined();
            expect(res.body.user.expiredConfirm).toBeUndefined();
            expect(res.body.user.resetPwCode).toBeUndefined();
            expect(res.body.user.expiredResetPw).toBeUndefined();

            expect(res.body.user.groups).toBeDefined();
            expect(res.body.user.groups[0]).toBeDefined();
            expect(res.body.user.groups[0].id).toBeDefined();
            expect(res.body.user.groups[0].name).toBeDefined();
            expect(res.body.user.groups[0].title).toBeDefined();
            expect(res.body.user.groups[0].permissions[0]).toBeDefined();
            expect(res.body.user.groups[0].permissions[0].id).toBeDefined();
            expect(res.body.user.groups[0].permissions[0].name).toBeDefined();
            expect(res.body.user.groups[0].permissions[0].title).toBeDefined();
            expect(
              res.body.user.groups[0].permissions[0].contentType,
            ).toBeDefined();
            expect(
              res.body.user.groups[0].permissions[0].contentType.id,
            ).toBeDefined();
            expect(
              res.body.user.groups[0].permissions[0].contentType.name,
            ).toBeDefined();
            expect(
              res.body.user.groups[0].permissions[0].contentType.title,
            ).toBeDefined();
            expect(res.body.token).toBeDefined();
          });
      });

      // TODO must return 400 instead of 404
      it('/ (POST) can not sign in with wrong email', () => {
        return request(app.getHttpServer())
          .post('/api/auth/signin')
          .send({
            email: 'wrong@admin.com',
            password: pass,
          })
          .expect(404);
      });

      it('/ (POST) can not sign in with wrong password', () => {
        return request(app.getHttpServer())
          .post('/api/auth/signin')
          .send({
            email: 'admin@admin.com',
            password: '123',
          })
          .expect(400);
      });

      it('/ (POST) can not sign in with wrong header', () => {
        return (
          request(app.getHttpServer())
            .post('/api/auth/signin')
            // Do not add `tnid` header
            .set('tnid', '123')
            .send({
              email: 'admin@admin.com',
              password: '123',
            })
            .expect(400)
        );
      });
    });
  });

  describe('Sign up', () => {
    describe('Sign up by email', () => {
      it('/ (POST) can sign up', () => {
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
            expect(res.body.user).toBeDefined();
            expect(res.body.user.id).toBeDefined();
            expect(res.body.user.username).toBeDefined();
            expect(res.body.user.firstName).toBeDefined();
            expect(res.body.user.lastName).toBeDefined();
            expect(res.body.user.email).toBeDefined();
            expect(res.body.user.isActive).toBe(false);
            expect(res.body.user.groups).toBeDefined();
            expect(res.body.user.groups[0]).toBeDefined();
            expect(res.body.user.groups[0].id).toBeDefined();
            expect(res.body.user.groups[0].name).toBeDefined();
            expect(res.body.user.groups[0].title).toBeDefined();
            expect(res.body.user.groups[0].permissions[0]).toBeDefined();
            expect(res.body.user.groups[0].permissions[0].id).toBeDefined();
            expect(res.body.user.groups[0].permissions[0].name).toBeDefined();
            expect(res.body.user.groups[0].permissions[0].title).toBeDefined();
            expect(
              res.body.user.groups[0].permissions[0].contentType,
            ).toBeDefined();
            expect(
              res.body.user.groups[0].permissions[0].contentType.id,
            ).toBeDefined();
            expect(
              res.body.user.groups[0].permissions[0].contentType.name,
            ).toBeDefined();
            expect(
              res.body.user.groups[0].permissions[0].contentType.title,
            ).toBeDefined();
            expect(res.body.token).toBeDefined();
          });
      });

      it('/ (POST) can not sign up douplicate email', () => {
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
          .then(() => {
            request(app.getHttpServer())
              .post('/api/auth/signup')
              .send({
                email,
                username: faker.random.word(),
                password,
              })
              .expect(409);
          });
      });

      it('/ (POST) can not sign up douplicate username', () => {
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
          .then(() => {
            request(app.getHttpServer())
              .post('/api/auth/signup')
              .send({
                email: faker.internet.email(),
                username,
                password,
              })
              .expect(409);
          });
      });
    });
  });

  describe('Sign info', () => {
    it('/ (POST) 200 can get info', () => {
      return request(app.getHttpServer())
        .post('/api/auth/info')
        .send({
          token: superToken,
        })
        .expect(200)
        .then(res => {
          expect(res.body.user).toBeDefined();
          expect(res.body.user.id).toBeDefined();
          expect(res.body.user.username).toBeDefined();
          expect(res.body.user.firstName).toBeDefined();
          expect(res.body.user.lastName).toBeDefined();
          expect(res.body.user.email).toBeDefined();
          expect(res.body.user.groups).toBeDefined();
          expect(res.body.user.groups[0]).toBeDefined();
          expect(res.body.user.groups[0].id).toBeDefined();
          expect(res.body.user.groups[0].name).toBeDefined();
          expect(res.body.user.groups[0].title).toBeDefined();
          expect(res.body.user.groups[0].permissions[0]).toBeDefined();
          expect(res.body.user.groups[0].permissions[0].id).toBeDefined();
          expect(res.body.user.groups[0].permissions[0].name).toBeDefined();
          expect(res.body.user.groups[0].permissions[0].title).toBeDefined();
          expect(
            res.body.user.groups[0].permissions[0].contentType,
          ).toBeDefined();
          expect(
            res.body.user.groups[0].permissions[0].contentType.id,
          ).toBeDefined();
          expect(
            res.body.user.groups[0].permissions[0].contentType.name,
          ).toBeDefined();
          expect(
            res.body.user.groups[0].permissions[0].contentType.title,
          ).toBeDefined();
          expect(res.body.token).toBeDefined();
        });
    });

    it('/ (POST) 200 can not get info by wrong token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/info')
        .send({
          token: 'superToken',
        })
        .expect(400);
    });
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    // Empty
  });
});
