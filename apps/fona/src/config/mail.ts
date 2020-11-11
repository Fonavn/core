import { IMailConfig } from '@lib/mail';

export default () => {
  const config = {
    from: process.env.MAIL_FROM,
    verifyHost: process.env.MAIL_VERIFY_HOST,
    templates: {
      confirm: process.env.MAIL_TEMPLATE_CONFIRM,
      forgetPassword: process.env.MAIL_TEMPLATE_FORGET_PASSWORD,
      passwordChanged: process.env.MAIL_TEMPLATE_PASSWORD_CHANGED,
    },
  } as IMailConfig;

  return Object.freeze({ mail: config });
};
