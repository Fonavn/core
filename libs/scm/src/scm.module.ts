import { Module } from '@nestjs/common';
import { ScmService } from './scm.service';
import { InventoryModule } from './inventory/inventory.module';
import { PurchaseOrderModule } from './purchase-order/purchase-order.module';
import { SaleOrderModule } from './sale-order/sale-order.module';
import { ProductModule } from './product/product.module';
import { CollectionModule } from './collection/collection.module';
import { CollectionService } from './collection/collection.service';
import { TenantModule } from '@lib/tenant';
import { ProductService } from './product/product.service';

@Module({
  providers: [ScmService, CollectionService, ProductService],
  exports: [ScmService, CollectionService, ProductService],
  imports: [
    InventoryModule,
    PurchaseOrderModule,
    SaleOrderModule,
    ProductModule,
    CollectionModule,
    TenantModule
  ],
})
export class ScmModule { }
