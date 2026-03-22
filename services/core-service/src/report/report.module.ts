import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Purchase, PurchaseSchema } from '../purchases/schemas/purchase.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Purchase.name, schema: PurchaseSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}