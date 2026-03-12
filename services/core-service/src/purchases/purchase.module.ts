import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Purchase, PurchaseSchema } from './schemas/purchase.schema';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { ProductsModule } from '../products/products.module'; // ← importer ProductsModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Purchase.name, schema: PurchaseSchema }]),
    ProductsModule, // ← nécessaire pour ProductService
  ],
  controllers: [PurchaseController],
  providers: [PurchaseService],
})
export class PurchasesModule {}
