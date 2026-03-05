// inventory.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryItem, InventoryItemSchema } from './schemas/inventory.schema';
import { ProductsModule } from '../products/products.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: InventoryItem.name, schema: InventoryItemSchema }]),
    forwardRef(() => ProductsModule),
    forwardRef(() => AlertsModule), // injection service pour checker alert
  ],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}