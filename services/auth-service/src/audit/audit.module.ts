import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule'; // ← Ajouter
import { MongooseModule } from '@nestjs/mongoose';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditCron } from './audit.cron'; // ← Ajouter
import { Audit, AuditSchema } from './schemas/audit.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(), // ← Ajouter
    MongooseModule.forFeature([
      { name: Audit.name, schema: AuditSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AuditController],
  providers: [AuditService, AuditCron], // ← Ajouter AuditCron
  exports: [AuditService],
})
export class AuditModule {}