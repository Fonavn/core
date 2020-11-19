import { TenantModule } from '@lib/tenant';
import { Module } from '@nestjs/common';
import { TemplateSettingService } from './service/template-setting.service';
import { TemplateService } from './service/template.service';

@Module({
    imports: [TenantModule],
    providers: [TemplateService, TemplateSettingService],
})
export class TemplateModule { }
