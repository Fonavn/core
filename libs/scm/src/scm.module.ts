import { Module } from '@nestjs/common';
import { ScmService } from './scm.service';
import { InventoryModule } from './inventory/inventory.module';
import { PurchaseOrderModule } from './purchase-order/purchase-order.module';
import { SaleOrderModule } from './sale-order/sale-order.module';
import { ProductModule } from './product/product.module';

@Module({
  providers: [ScmService],
  exports: [ScmService],
  imports: [
    InventoryModule,
    PurchaseOrderModule,
    SaleOrderModule,
    ProductModule,
  ],
})
export class ScmModule {}
