import { Controller, Get, UseGuards, Req, Query, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { AuditService } from './audit.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../auth/decorators/user.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('audits')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /* =========================
     GET CURRENT USER'S AUDIT LOGS
     Rôle: Tous utilisateurs authentifiés
  ========================= */
  @Get('me')
  async getMyAudits(
    @User() user: any,
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = user._id?.toString() || user.sub;
    
    // Correction: gestion des valeurs undefined
    const pageNum = Math.max(1, parseInt(page || '1'));
    const limitNum = Math.min(100, parseInt(limit || '50'));

    // Log l'accès pour DevSecOps
    await this.auditService.log({
      userId: userId,
      action: 'VIEW_OWN_AUDITS',
      entity: 'AUDIT',
      ip: req.ip || req.socket?.remoteAddress,
      endpoint: req.originalUrl,
      details: { page: pageNum, limit: limitNum },
    });

    return this.auditService.findByUser(userId, pageNum, limitNum);
  }

  /* =========================
     GET ALL AUDIT LOGS
     Rôle: ADMIN ou SUPER_ADMIN uniquement
  ========================= */
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get()
  async getAllAudits(
    @User() user: any,
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') filterByUserId?: string,
    @Query('action') filterByAction?: string,
    @Query('entity') filterByEntity?: string,
  ) {
    const userId = user._id?.toString() || user.sub;
    
    // Correction: gestion des valeurs undefined
    const pageNum = Math.max(1, parseInt(page || '1'));
    const limitNum = Math.min(100, parseInt(limit || '50'));

    // Vérification supplémentaire: seul SUPER_ADMIN peut voir les logs des autres admins
    if (filterByUserId && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can filter by specific user ID');
    }

    // Log l'accès admin pour DevSecOps
    await this.auditService.log({
      userId: userId,
      action: 'VIEW_ALL_AUDITS',
      entity: 'AUDIT',
      ip: req.ip || req.socket?.remoteAddress,
      endpoint: req.originalUrl,
      details: { 
        page: pageNum, 
        limit: limitNum, 
        filters: { userId: filterByUserId, action: filterByAction, entity: filterByEntity } 
      },
    });

    // Appel du service avec des paramètres nommés (objet)
    return this.auditService.findAll({
      page: pageNum,
      limit: limitNum,
      userId: filterByUserId,
      action: filterByAction,
      entity: filterByEntity,
    });
  }

  /* =========================
     GET AUDIT LOGS BY SPECIFIC USER (SUPER_ADMIN ONLY)
     Rôle: SUPER_ADMIN uniquement
  ========================= */
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('users/:targetUserId')
  async getUserAudits(
    @User() user: any,
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('targetUserId') targetUserId?: string,
  ) {
    const userId = user._id?.toString() || user.sub;
    
    // Correction: gestion des valeurs undefined
    const pageNum = Math.max(1, parseInt(page || '1'));
    const limitNum = Math.min(100, parseInt(limit || '50'));

    if (!targetUserId) {
      throw new ForbiddenException('targetUserId is required');
    }

    // Log l'accès super admin pour DevSecOps
    await this.auditService.log({
      userId: userId,
      action: 'VIEW_USER_AUDITS',
      entity: 'AUDIT',
      ip: req.ip || req.socket?.remoteAddress,
      endpoint: req.originalUrl,
      details: { targetUserId, page: pageNum, limit: limitNum },
    });

    return this.auditService.findByUser(targetUserId, pageNum, limitNum);
  }
}