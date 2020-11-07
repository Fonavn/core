import { MASTER_TNID } from '@lib/tenant/const';
import { ConnectionOptions } from 'typeorm';
export default () => {
  let config = {
    name: 'default',
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    database: process.env.DB_DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    autoLoadEntities: true,
    synchronize: false,
    logging: true,
  };

  if (process.env.NODE_ENV === 'test') {
    config = {
      ...config,
      database: 'fona-test',
      logging: false,
    };
  }

  return Object.freeze({ database: config });
};
