import { Permissions } from '@lib/core';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { SiteSettingEntity } from '../entity/site-setting.entity';
import { SiteSettingService } from '../service/site-setting.service';

@Permissions('change_profile')
@ApiTags('site-settings')
@Crud({
  model: {
    type: SiteSettingEntity,
  }
})
@Controller('/site-settings')
export class SiteSettingController implements CrudController<SiteSettingEntity> {
  constructor(public service: SiteSettingService) {}
}
