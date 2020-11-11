import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import {
  SendGridModule,
  SendGridService,
  SendGridModuleAsyncOptions,
  SENDGRID_MODULE_OPTIONS,
} from '@ntegral/nestjs-sendgrid';
import { MailService } from './mail.service';
import { EMAIL_CONFIG_TOKEN } from '@app/fona/const';

@Module({
  imports: [SendGridModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {
  static forRootAsync(
    sendGridOption: SendGridModuleAsyncOptions,
    mailOption: IMailOption,
  ): DynamicModule {
    return {
      module: MailModule,
      imports: [
        ...mailOption.imports,
        SendGridModule.forRootAsync({
          imports: [...sendGridOption.imports],
          useFactory: sendGridOption.useFactory,
          inject: sendGridOption.inject,
        }),
      ],
      providers: [
        SendGridService,
        {
          provide: EMAIL_CONFIG_TOKEN,
          useFactory: mailOption.useFactory,
          inject: mailOption.inject,
        },
        {
          provide: SENDGRID_MODULE_OPTIONS,
          useValue: sendGridOption.useFactory,
        },
      ],
      exports: [
        EMAIL_CONFIG_TOKEN,
        SendGridService,
        SENDGRID_MODULE_OPTIONS,
        EMAIL_CONFIG_TOKEN,
      ],
      global: true,
    };
  }
}

export interface IMailConfig {
  from: string;
  verifyHost: string;
  templates: {
    confirm: string;
    forgetPassword: string;
    passwordChanged: string;
  };
}

export interface IMailOption extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory: (...args: any[]) => Promise<IMailConfig> | IMailConfig;
}
