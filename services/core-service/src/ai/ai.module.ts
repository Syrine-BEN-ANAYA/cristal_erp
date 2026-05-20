import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';

import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { AnalyticsService } from './analytics.service';
import { Customer } from '../customers/schemas/customer.schema';
import { CustomerSchema } from '../customers/schemas/customer.schema';
import { Supplier } from '../suppliers/schemas/supplier.schema';
import { SupplierSchema } from '../suppliers/schemas/supplier.schema';

@Module({
  imports: [
  
      MongooseModule.forFeature([
  { name: Order.name, schema: OrderSchema },
  { name: Product.name, schema: ProductSchema },
  { name: Customer.name, schema: CustomerSchema },
  { name: Supplier.name, schema: SupplierSchema },
])
  
  ],
  controllers: [AiController],
  providers: [AiService, AnalyticsService],
})
export class AiModule {}