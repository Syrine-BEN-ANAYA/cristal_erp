import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ProductService } from './products.service';
import { ProductController } from './products.controller'; // ← ajoute le controller
import { Product, ProductSchema } from './schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [ProductController], // ← indispensable pour exposer /products
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductsModule {} // ← renommer en ProductModule pour correspondre à ton import