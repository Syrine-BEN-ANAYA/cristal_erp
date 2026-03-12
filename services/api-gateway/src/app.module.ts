import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

// Interceptors & Guards
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

// Gateways (controllers qui forward vers les microservices)
import { AuthGateway } from './routes/auth.gateway';
import { UsersGateway } from './routes/users.gateway';
import { ProductsGateway } from './routes/products.gateway';
import { OrdersGateway } from './routes/orders.gateway';
import { SuppliersGateway } from './routes/suppliers.gateway';
import { CustomersGateway } from './routes/customers.gateway';
import { PurchasesGateway } from './routes/purchase.gateway';

@Module({
  controllers: [
    AuthGateway,
    UsersGateway,
    ProductsGateway,
    OrdersGateway,
    SuppliersGateway,
    CustomersGateway,
    PurchasesGateway
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    JwtAuthGuard, // injecté si nécessaire dans d’autres providers
  ],
})
export class AppModule {}
