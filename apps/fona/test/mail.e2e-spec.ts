import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { SendGridService } from '@ntegral/nestjs-sendgrid';
import { EMAIL_CONFIG_TOKEN } from '@app/fona/const';
import { IMailConfig } from '@lib/mail';

describe('Application (e2e)', () => {
  let app;
  let sendGridService: SendGridService;
  let mailConfig: IMailConfig;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    sendGridService = moduleFixture.get('SendGridToken');
    mailConfig = moduleFixture.get(EMAIL_CONFIG_TOKEN);
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('Send confirmation account', async () => {
    sendGridService.send({
      to: 'ngd.nghia28@gmail.com',
      from: mailConfig.from,
      templateId: mailConfig.templates.confirm,
      dynamicTemplateData: {
        link: 'http://google.com',
        expiredDate: new Date(),
      },
    });
  });

  it('Send change password request', async () => {
    sendGridService.send({
      to: 'ngd.nghia28@gmail.com',
      from: mailConfig.from,
      templateId: mailConfig.templates.forgetPassword,
      dynamicTemplateData: {
        link: 'http://google.com',
        expiredDate: new Date(),
      },
    });
  });

  it('Send password changed notification', async () => {
    sendGridService.send({
      to: 'ngd.nghia28@gmail.com',
      from: mailConfig.from,
      templateId: mailConfig.templates.passwordChanged,
      dynamicTemplateData: {
        link: 'http://google.com',
      },
    });
  });

  afterEach(async () => {
    return app && app.close();
  });
});
