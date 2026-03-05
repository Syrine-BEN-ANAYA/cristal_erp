// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';

import { OrdersModule } from './orders/orders.module';
import { AlertsModule } from './alerts/alerts.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { InventoryModule } from './inventory/inventory.module';

dotenv.config();

// Vérification de la variable d'environnement
if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI not set in .env');
}

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI), // TypeScript sait que c'est une string
    OrdersModule,
    AlertsModule,
    ProductsModule,
    CategoriesModule,
    InventoryModule
  ],
})
export class AppModule {}