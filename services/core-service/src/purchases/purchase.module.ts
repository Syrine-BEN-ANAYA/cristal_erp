import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { Purchase, PurchaseSchema } from './schemas/purchase.schema';
import { ProductsModule } from '../products/products.module';
import { AuditClient } from '../audit/audit.client';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Purchase.name, schema: PurchaseSchema }]),
    ProductsModule,
  ],
  controllers: [PurchaseController],
  providers: [PurchaseService, AuditClient],
  exports: [PurchaseService],
})
export class PurchaseModule {}