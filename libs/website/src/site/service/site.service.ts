import { Inject } from '@nestjs/common';
import { TenantService } from '@lib/tenant/tenant-service.decorator';
import { Connection } from 'typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { TENANT_CONNECTION } from '@lib/tenant/const';
import { SiteEntity } from '../entity/site.entity';

@TenantService()
export class SiteService extends TypeOrmCrudService<SiteEntity> {
  constructor(@Inject(TENANT_CONNECTION) private connection: Connection) {
    super(connection.getRepository(SiteEntity));
  }

  async getByHost(host: string) {
    return this.repo.findOne({ host });
  }
}
