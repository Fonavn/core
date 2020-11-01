// TODO use this import { registerAs } from '@nestjs/config';
export default () => ({
  database: {
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    database: process.env.DB_DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    // TODO may use this: https://medium.com/@p3rf/solving-issue-with-entities-loading-for-a-nx-dev-monorepo-setup-with-nest-js-and-typeorm-282d4491f0bc
    autoLoadEntities: true,
    synchronize: true,
    logging: true,
  },
});
