import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuditService } from './audit.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';


@Controller('audits')
export class AuditController {
  constructor(private auditService: AuditService) {}

  /* =========================
     USER AUDITS
  ========================= */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyAudits(@User() user: any) {
    // Log access pour DevSecOps
    await this.auditService.log({
      userId: user._id?.toString() || user.sub,
      action: 'VIEW_OWN_AUDITS',
      entity: 'AUDIT',
    });

    return this.auditService.findByUser(user._id || user.sub);
  }

  /* =========================
     ADMIN/SUPER_ADMIN AUDITS
  ========================= */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get()
  async getAllAudits(@User() user: any) {
    // Log accès admin pour DevSecOps
    await this.auditService.log({
      userId: user._id?.toString() || user.sub,
      action: 'VIEW_ALL_AUDITS',
      entity: 'AUDIT',
    });

    return this.auditService.findAll();
  }
}