import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Crud,
  CrudController,
  CrudRequest,
  Override,
  ParsedRequest,
} from '@nestjsx/crud';
import { Roles } from './decorators/roles.decorator';
import { InTenantDto } from './dto/in-tenant.dto';
import { InUpdateTenantDto } from './dto/in-update-tenant.dto';
import { TenantEntity } from './tenant.entity';
import { TenantServicez } from './tenant.service';

@ApiTags('tenants')
@ApiBearerAuth()
@Roles('isSuperuser')
@Crud({
  model: {
    type: TenantEntity,
  },
  dto: {
    create: InTenantDto,
    update: InUpdateTenantDto,
  },
  query: {
    join: {
      database: { eager: true },
    },
  },
})
@Controller('/admin/tenants')
export class TenantController implements CrudController<TenantEntity> {
  constructor(public service: TenantServicez) {}
}
