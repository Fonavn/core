import { Permissions } from '@lib/core';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { ProductEntity } from './entity/product.entity';
import { ProductService } from './product.service';

@Permissions('change_profile')
@ApiTags('products')
@Crud({
  model: {
    type: ProductEntity,
  }
})
@Controller('/products')
export class ProductController implements CrudController<ProductEntity> {
  constructor(public service: ProductService) {}
}
