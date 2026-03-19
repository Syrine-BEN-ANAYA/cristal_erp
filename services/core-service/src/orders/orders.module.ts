import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ProductsModule } from '../products/products.module'; // 🔹 Import du module produit
import { Order, OrderItem, OrderItemSchema, OrderSchema } from './schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderItem.name, schema: OrderItemSchema },
    ]),
    ProductsModule, // 🔹 Injection de ProductService
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}