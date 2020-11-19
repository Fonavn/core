import { StorageService } from '@lib/storage';
import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { STORAGE_SERVICE_TOKEN } from '@lib/storage/const';
import { User } from '@lib/core';
import * as HandleBars from 'handlebars';
import { TemplateSettingService } from '@lib/website/template/service/template-setting.service';
import { SiteService } from '@lib/website/site/service/site.service';
import { SiteSettingService } from '@lib/website/site/service/site-setting.service';
import { SiteTemplateSettingService } from '@lib/website/site/service/site-template-setting.service';
import { SitePageSettingService } from '@lib/website/site/service/site-page-setting.service';
import { SiteEntity } from '@lib/website/site/entity/site.entity';
import { TENANT_ID_HEADER } from '@lib/tenant/const';
import { SiteSettingEntity } from '@lib/website/site/entity/site-setting.entity';
import { SiteTemplateSettingEntity } from '@lib/website/site/entity/site-template-setting.entity';
import { SitePageSettingEntity } from '@lib/website/site/entity/site-page-setting.entity';
import { CollectionService } from '@lib/scm/collection/collection.service';
import { ProductService } from '@lib/scm/product/product.service';

interface Collection {
  id: string;
  name: string;
}
interface Product {
  name: string;
}
@Controller()
export class EngineController {
  constructor(
    @Inject(STORAGE_SERVICE_TOKEN) private storageService: StorageService,
    private readonly siteService: SiteService,
    private readonly siteSettingService: SiteSettingService,
    private readonly siteTemplateSettingService: SiteTemplateSettingService,
    private readonly sitePageSettingService: SitePageSettingService,
    private readonly collectionService: CollectionService,
    private readonly productService: ProductService,
  ) {}
  // index,
  // product listing
  //  - ?
  //  - ?
  // product detail
  // cart
  // checkout
  //  - address
  //  - payment
  // tracking order
  //
  // other
  //  - css
  //  - images
  // TODO only get html from here. other use S3 or GCS
  // TODO handle error
  // TODO validate path
  @Get('*')
  async get(@Req() req: Request, @Res() res: Response) {
    // const user = (req as any).user as User;
    const path = req.path;
    const productId = path.match(/.*\/(.*)?/)[1];
    // TODO use real host instead of tnid
    const host = req.headers[TENANT_ID_HEADER] as string;

    // get template setting
    const site: SiteEntity = await this.siteService.getByHost(host);
    const siteSetting: SiteSettingEntity = await this.siteSettingService.getBySite(
      site.id,
    );
    const siteTemplateSetting: SiteTemplateSettingEntity = await this.siteTemplateSettingService.getBySite(
      site.id,
    );
    const sitePageSetting: SitePageSettingEntity = await this.sitePageSettingService.getByPath(
      path,
    );

    // get data for setting
    let collections, product;
    if ((sitePageSetting.settings as any).collections) {
      const cls = (sitePageSetting.settings as any).collections as Collection[];
      collections = await Promise.all(
        cls.map(cl => {
          return { [cl.name]: this.collectionService.findOne(cl.id) };
        }),
      );
    }
    if ((sitePageSetting.settings as any).product) {
      product = await this.productService.findOne(productId);
    }

    const data = {
      site,
      siteSetting,
      siteTemplateSetting,
      sitePageSetting: {
        collections,
        product,
      },
    };

    // read template
    // TODO support multiple template
    try {
      const source = this.storageService.download(`${site.id}/${path}.hbs`);
      const template = HandleBars.compile(source);
      res.send(template(data));
    } catch (err) {
      throw new NotFoundException();
    }
  }
}
