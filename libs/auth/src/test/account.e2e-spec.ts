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
import {
  CoreModule,
  CORE_CONFIG_TOKEN,
  DEFAULT_CORE_CONFIG,
  UsersService,
} from '@lib/core';
import adminRoutes from '@app/fona/config/admin-route';
import { DEFAULT_AUTH_CORE_CONFIG } from '../configs/core.config';
import { InConfirmDto } from '../dto/in-confirm.dto';
import { SendGridModule, SendGridService } from '@ntegral/nestjs-sendgrid';
import { MailModule } from '@lib/mail';

jest.setTimeout(10000);
describe('Account (e2e)', () => {
  let app;
  let connectionOptions: ConnectionOptions;
  let usersService: UsersService;
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

    usersService = moduleFixture.get(UsersService);
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

  describe('Confirmation', () => {
    let email;
    beforeEach(async () => {
      email = faker.internet.email();
      const username = faker.random.alphaNumeric(10);

      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email,
          password: pass,
          username,
        })
        .expect(201);

      expect(sendGridServiceSpy).toHaveBeenCalled();
    });

    it('Can confirm account', async () => {
      const { user } = await usersService.findByEmail({ email });
      await request(app.getHttpServer())
        .post('/api/auth/confirm')
        .send({
          code: user.confirmCode,
        } as InConfirmDto)
        .expect(200);

      const { user: actived } = await usersService.findByEmail({ email });
      expect(actived.isActive).toBe(true);
    });

    it('Cannot confirm with wrong code', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/confirm')
        .send({
          code: 'wrong code',
        } as InConfirmDto)
        .expect(400);
    });

    it('Cannot confirm with expired code', async () => {
      const { user } = await usersService.findByEmail({ email });
      user.expiredConfirm = new Date();
      await usersService.update({ id: user.id, item: user });
      await request(app.getHttpServer())
        .post('/api/auth/confirm')
        .send({
          code: user.confirmCode,
        } as InConfirmDto)
        .expect(400);
    });
  });

  describe('Forgot password', () => {
    let email;
    beforeEach(() => {
      email = faker.internet.email();
      const username = faker.random.alphaNumeric(10);

      return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email,
          password: pass,
          username,
        })
        .expect(201);
    });

    describe('Init reset password', () => {
      it('Can request change password', async () => {
        await request(app.getHttpServer())
          .post('/api/auth/forget-password')
          .send({
            email,
          })
          .expect(200);

        const { user } = await usersService.findByEmail({ email });
        expect(user.resetPwCode).toBeDefined();
        expect(user.expiredResetPw).toBeDefined();
        expect(sendGridServiceSpy).toHaveBeenCalled();
      });

      it('Cannot request change password with wrong email', async () => {
        await request(app.getHttpServer())
          .post('/api/auth/forget-password')
          .send({
            email: faker.internet.email(),
          })
          .expect(400);
      });
    });

    describe('Do reset password', () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post('/api/auth/forget-password')
          .send({
            email,
          })
          .expect(200);
        expect(sendGridServiceSpy).toHaveBeenCalled();
      });

      it('Can reset password', async () => {
        const { user } = await usersService.findByEmail({ email });
        request(app.getHttpServer())
          .post('/api/auth/reset-password')
          .send({
            email,
            code: user.resetPwCode,
            newPassword: faker.random.alphaNumeric(10),
          })
          .expect(200);
        expect(sendGridServiceSpy).toHaveBeenCalled();
      });

      it('Cannot reset password with wrong code', async () => {
        const { user } = await usersService.findByEmail({ email });
        request(app.getHttpServer())
          .post('/api/auth/reset-password')
          .send({
            email,
            code: 'wrong code',
            newPassword: faker.random.alphaNumeric(10),
          })
          .expect(400);
      });

      it('Cannot reset password because expired code', async () => {
        const { user } = await usersService.findByEmail({ email });
        user.expiredResetPw = new Date();
        await usersService.update({ id: user.id, item: user });
        request(app.getHttpServer())
          .post('/api/auth/reset-password')
          .send({
            email,
            code: user.resetPwCode,
            newPassword: faker.random.alphaNumeric(10),
          })
          .expect(400);
      });
    });
  });

  describe('Change password', () => {
    let email;
    let token;
    beforeEach(async () => {
      email = faker.internet.email();
      const username = faker.random.alphaNumeric(10);
      await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email,
          password: pass,
          username,
        })
        .expect(201);
      const { user } = await usersService.findByEmail({ email });
      user.isActive = true;
      await usersService.update({ id: user.id, item: user });

      return request(app.getHttpServer())
        .post('/api/auth/signin')
        .send({
          email,
          password: pass,
        })
        .expect(200)
        .then(res => {
          token = res.body.token;
        });
    });

    it('Can change password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/change-password')
        .set('Authorization', `JWT ${token}`)
        .send({
          oldPassword: pass,
          newPassword: '12345',
        })
        .expect(200);
      expect(sendGridServiceSpy).toHaveBeenCalled();
    });

    it('Cannot change password without login', () => {
      return request(app.getHttpServer())
        .post('/api/auth/change-password')
        .send({
          oldPassword: pass,
          newPassword: '12345',
        })
        .expect(403);
    });

    it('Cannot change password with wrong old password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/change-password')
        .set('Authorization', `JWT ${token}`)
        .send({
          oldPassword: 'wrong pass',
          newPassword: '12345',
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
