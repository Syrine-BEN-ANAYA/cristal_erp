import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { Audit, AuditSchema } from './schemas/audit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }]),
  ],
  providers: [AuditService],
  controllers: [AuditController],
  exports: [AuditService], // export pour utilisation dans AuthService, UsersService, etc.
})
export class AuditModule {}