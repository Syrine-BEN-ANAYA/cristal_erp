// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';

import { ProductsModule } from './products/products.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { PurchasesModule } from './purchases/purchase.module';

dotenv.config();

// Vérification de la variable d'environnement
if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI not set in .env');
}

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI), // TypeScript sait que c'est une string
    OrdersModule,
    ProductsModule,
    SuppliersModule,
    CustomersModule,
    PurchasesModule,
  ],
})
export class AppModule {}