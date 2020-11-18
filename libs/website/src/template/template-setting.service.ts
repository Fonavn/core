import { Inject } from '@nestjs/common';
import { TenantService } from '@lib/tenant/tenant-service.decorator';
import { Connection } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { TENANT_CONNECTION } from '@lib/tenant/const';
import { TemplateSettingEntity } from './template-setting.entity';

@TenantService()
export class TemplateSettingService extends TypeOrmCrudService<
  TemplateSettingEntity
> {
  constructor(@Inject(TENANT_CONNECTION) private connection: Connection) {
    super(connection.getRepository(TemplateSettingEntity));
  }
}
