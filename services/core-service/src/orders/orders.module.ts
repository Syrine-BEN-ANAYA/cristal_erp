import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderService } from './orders.service';
import { OrderController } from './orders.controller';
import { ProductsModule } from '../products/products.module'; // ← importer ProductsModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ProductsModule, // ← permet d’injecter ProductService
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrdersModule {}
