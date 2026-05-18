import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';
import { LeavesModule } from './leaves/leaves.module';
import { PayrollModule } from './payroll/payroll.module';
import { ContractsModule } from './contracts/contracts.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/hr-service'),
    EmployeesModule,
    DepartmentsModule,
    LeavesModule,
    PayrollModule,
    ContractsModule,
  ],
})
export class AppModule {}
