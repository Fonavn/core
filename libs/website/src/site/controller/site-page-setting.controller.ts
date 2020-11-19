import { Permissions } from '@lib/core';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { SitePageSettingEntity } from '../entity/site-page-setting.entity';
import { SitePageSettingService } from '../service/site-page-setting.service';

@Permissions('change_profile')
@ApiTags('site-page-settings')
@Crud({
  model: {
    type: SitePageSettingEntity,
  }
})
@Controller('/site-page-settings')
export class SitePageSettingController implements CrudController<SitePageSettingEntity> {
  constructor(public service: SitePageSettingService) {}
}
