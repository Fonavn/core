import { Inject } from '@nestjs/common';
import { TenantService } from '@lib/tenant/tenant-service.decorator';
import { Connection } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { TENANT_CONNECTION } from '@lib/tenant/const';
import { SitePageSettingEntity } from './site-page-setting.entity';

@TenantService()
export class SitePageSettingService extends TypeOrmCrudService<
  SitePageSettingEntity
> {
  constructor(@Inject(TENANT_CONNECTION) private connection: Connection) {
    super(connection.getRepository(SitePageSettingEntity));
  }

  getByPath(path: string) {
    return this.repo.findOne({ path });
  }
}
