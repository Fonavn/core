import { Module } from '@nestjs/common';
import { WebsiteService } from './website.service';
import { TemplateModule } from './template/template.module';
import { SiteModule } from './site/site.module';
import { SiteTemplateSettingService } from './site/service/site-template-setting.service';
import { SitePageSettingService } from './site/service/site-page-setting.service';
import { SiteSettingService } from './site/service/site-setting.service';
import { SiteService } from './site/service/site.service';
import { TemplateService } from './template/service/template.service';
import { TemplateSettingService } from './template/service/template-setting.service';
import { TenantModule } from '@lib/tenant';

@Module({
  providers: [
    WebsiteService, SiteService, SiteSettingService,
    SitePageSettingService, SiteTemplateSettingService,
    TemplateService, TemplateSettingService],
  exports: [
    WebsiteService, SiteService, SiteSettingService,
    SitePageSettingService, SiteTemplateSettingService,
    TemplateService, TemplateSettingService,
  ],
  controllers: [],
  imports: [TemplateModule, SiteModule, TenantModule],
})
export class WebsiteModule { }
