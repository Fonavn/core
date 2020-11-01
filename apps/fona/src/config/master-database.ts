import { DatabaseEntity } from '@lib/tenant/database/database.entity';
import { TenantEntity } from '@lib/tenant/tenant.entity';
import { ConnectionOptions } from 'typeorm';
export default () => ({
  database: {
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    database: process.env.DB_DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    // entities: [TenantEntity, DatabaseEntity],
    autoLoadEntities: true,
    synchronize: false,
    logging: true,
  } as ConnectionOptions,
});
