import { Permissions } from '@lib/core';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { SiteTemplateSettingEntity } from '../entity/site-template-setting.entity';
import { SiteTemplateSettingService } from '../service/site-template-setting.service';

@Permissions('change_profile')
@ApiTags('site-template-settings')
@Crud({
  model: {
    type: SiteTemplateSettingEntity
  }
})
@Controller('/site-template-settings')
export class SiteTemplateSettingController implements CrudController<SiteTemplateSettingEntity> {
  constructor(public service: SiteTemplateSettingService) {}
}
