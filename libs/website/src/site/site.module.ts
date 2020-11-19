import { TenantModule } from '@lib/tenant';
import { Module } from '@nestjs/common';
import { SitePageSettingController } from './controller/site-page-setting.controller';
import { SiteSettingController } from './controller/site-setting.controller';
import { SiteTemplateSettingController } from './controller/site-template-setting.controller';
import { SiteController } from './controller/site.controller';
import { SitePageSettingService } from './service/site-page-setting.service';
import { SiteSettingService } from './service/site-setting.service';
import { SiteTemplateSettingService } from './service/site-template-setting.service';
import { SiteService } from './service/site.service';

@Module({
    imports: [TenantModule],
    controllers: [SiteController, SitePageSettingController, SiteSettingController, SiteTemplateSettingController],
    providers: [SiteService, SiteSettingService, SitePageSettingService, SiteTemplateSettingService],
    exports: [SiteService, SiteSettingService, SitePageSettingService, SiteTemplateSettingService]
})
export class SiteModule { }
