import { Inject } from '@nestjs/common';
import { TenantService } from '@lib/tenant/tenant-service.decorator';
import { Connection } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { TENANT_CONNECTION } from '@lib/tenant/const';
import { SiteTemplateSettingEntity } from './site-template-setting.entity';

@TenantService()
export class SiteTemplateSettingService extends TypeOrmCrudService<
  SiteTemplateSettingEntity
> {
  constructor(@Inject(TENANT_CONNECTION) private connection: Connection) {
    super(connection.getRepository(SiteTemplateSettingEntity));
  }

  getBySite(siteId: string) {
    return this.repo.findOne({ siteId });
  }
}
