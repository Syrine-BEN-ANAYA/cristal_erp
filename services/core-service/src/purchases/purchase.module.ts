import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Purchase, PurchaseSchema } from './schemas/purchase.schema';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Purchase.name, schema: PurchaseSchema }]),
    ProductsModule, // ⚠️ obligatoire car utilisé dans service
  ],
  providers: [PurchaseService],
  controllers: [PurchaseController],
  exports: [PurchaseService], // 🔴 SI ÇA MANQUE → ERREUR
})
export class PurchaseModule {}