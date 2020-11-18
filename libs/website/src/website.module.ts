import { Module } from '@nestjs/common';
import { WebsiteService } from './website.service';
import { TemplateModule } from './template/template.module';
import { SiteModule } from './site/site.module';

@Module({
  providers: [WebsiteService],
  exports: [WebsiteService],
  imports: [TemplateModule, SiteModule],
})
export class WebsiteModule {}
