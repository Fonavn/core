import { Inject } from '@nestjs/common';
import { TenantService } from '@lib/tenant/tenant-service.decorator';
import { Connection } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { TENANT_CONNECTION } from '@lib/tenant/const';
import { SiteSettingEntity } from './site-setting.entity';

@TenantService()
export class SiteSettingService extends TypeOrmCrudService<SiteSettingEntity> {
  constructor(@Inject(TENANT_CONNECTION) private connection: Connection) {
    super(connection.getRepository(SiteSettingEntity));
  }

  getBySite(siteId: string) {
    return this.repo.findOne({ siteId });
  }
}
