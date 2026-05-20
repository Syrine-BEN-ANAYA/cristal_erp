import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';

import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

import { AuthGateway } from './routes/auth.gateway';
import { UsersGateway } from './routes/users.gateway';
import { ProductsGateway } from './routes/products.gateway';
import { OrdersGateway } from './routes/orders.gateway';
import { SuppliersGateway } from './routes/suppliers.gateway';
import { CustomersGateway } from './routes/customers.gateway';
import { PurchasesGateway } from './routes/purchase.gateway';
import { HealthController } from './health.controller';
import { AuditGateway } from './routes/audit.gateway';
import { EmployeesGateway } from './routes/employees.gateway';
import { DepartmentsGateway } from './routes/departments.gateway';
import { ContractsGateway } from './routes/contracts.gateway';
import { LeavesGateway } from './routes/leaves.gateway';
import { PayrollGateway } from './routes/payroll.gateway';
import { AiGateway } from './routes/ai.gateway';

@Module({
  imports: [HttpModule],

  controllers: [
    AuthGateway,
    UsersGateway,
    ProductsGateway,
    OrdersGateway,
    SuppliersGateway,
    CustomersGateway,
    PurchasesGateway,
    HealthController,
    AuditGateway,
    EmployeesGateway,
    DepartmentsGateway,
    ContractsGateway,
    LeavesGateway,
    PayrollGateway,
    AiGateway,
  ],

  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    JwtAuthGuard,
  ],
})
export class AppModule {}
