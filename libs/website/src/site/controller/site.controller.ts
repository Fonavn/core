import { Permissions } from '@lib/core';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { SiteEntity } from '../entity/site.entity';
import { SiteService } from '../service/site.service';

@Permissions('change_profile')
@ApiTags('sites')
@Crud({
  model: {
    type: SiteEntity,
  }
})
@Controller('/sites')
export class SiteController implements CrudController<SiteEntity> {
  constructor(public service: SiteService) {}
}
