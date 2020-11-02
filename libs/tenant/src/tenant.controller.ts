import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { TenantEntity } from './tenant.entity';
import { TenantServicez } from './tenant.service';

@ApiTags('tenant')
@Crud({
  model: {
    type: TenantEntity,
  },
})
@Controller('/api/tenant')
export class TenantController implements CrudController<TenantEntity> {
  constructor(public service: TenantServicez) {}
}
