import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ProductsModule } from './products/products.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { ReportModule } from './report/report.module';
import { PurchaseModule } from './purchases/purchase.module';
import { AiModule } from './ai/ai.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');


        if (!uri) {
          throw new Error('MONGO_URI must be defined in .env');
        }

        return {
          uri,
        };
      },
    }),

    OrdersModule,
    ProductsModule,
    SuppliersModule,
    CustomersModule,
    PurchaseModule,
    ReportModule,
    AiModule,
  ],
})
export class AppModule {}