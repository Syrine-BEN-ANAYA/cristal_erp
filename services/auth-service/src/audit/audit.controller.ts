import { Controller, Get, UseGuards, Req, Query, ForbiddenException, Delete, Res, Param } from '@nestjs/common';
import { Request, Response } from 'express';
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
    
    const pageNum = Math.max(1, parseInt(page || '1'));
    const limitNum = Math.min(100, parseInt(limit || '50'));

    await this.auditService.log({
      userId: userId,
      username: user.username,
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
    
    const pageNum = Math.max(1, parseInt(page || '1'));
    const limitNum = Math.min(100, parseInt(limit || '50'));

    if (filterByUserId && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can filter by specific user ID');
    }

    await this.auditService.log({
      userId: userId,
      username: user.username,
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
    @Param('targetUserId') targetUserId?: string,
  ) {
    const userId = user._id?.toString() || user.sub;
    
    const pageNum = Math.max(1, parseInt(page || '1'));
    const limitNum = Math.min(100, parseInt(limit || '50'));

    if (!targetUserId) {
      throw new ForbiddenException('targetUserId is required');
    }

    await this.auditService.log({
      userId: userId,
      username: user.username,
      action: 'VIEW_USER_AUDITS',
      entity: 'AUDIT',
      ip: req.ip || req.socket?.remoteAddress,
      endpoint: req.originalUrl,
      details: { targetUserId, page: pageNum, limit: limitNum },
    });

    return this.auditService.findByUser(targetUserId, pageNum, limitNum);
  }

  /* =========================
     STORAGE MANAGEMENT
  ========================= */
  
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('storage/stats')
  async getStorageStats(@User() user: any) {
    return this.auditService.getStorageStats();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('storage/count')
  async countLogs() {
    const count = await this.auditService.countLogs();
    return { count };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete('cleanup')
  async autoCleanup(@User() user: any, @Req() req: Request) {
    const result = await this.auditService.autoCleanup();
    
    await this.auditService.log({
      userId: user._id.toString(),
      username: user.username,
      action: 'AUTO_CLEANUP',
      entity: 'AUDIT',
      ip: req.ip,
      endpoint: req.originalUrl,
      details: result,
    });
    
    return result;
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete('reset')
  async resetLogs(@User() user: any, @Req() req: Request) {
    const deletedCount = await this.auditService.resetAllLogs();
    
    await this.auditService.log({
      userId: user._id.toString(),
      username: user.username,
      action: 'RESET_ALL_LOGS',
      entity: 'AUDIT',
      ip: req.ip,
      endpoint: req.originalUrl,
      details: { deletedCount },
    });
    
    return { message: 'All logs deleted', deletedCount };
  }
  
  /* =========================
     EXPORT LOGS (CSV/JSON)
  ========================= */
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('export')
  async exportLogs(
    @User() user: any,
    @Req() req: Request,
    @Res() res: Response,
    @Query('format') format: 'csv' | 'json' = 'csv',
    @Query('userId') filterByUserId?: string,
    @Query('action') filterByAction?: string,
    @Query('entity') filterByEntity?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Construire le filtre
    const filter: any = {};
    if (filterByUserId) filter.userId = filterByUserId;
    if (filterByAction) filter.action = filterByAction;
    if (filterByEntity) filter.entity = filterByEntity;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Récupérer les logs
    const logs = await this.auditService.findAllForExport(filter);

    // Log l'export
    await this.auditService.log({
      userId: user._id.toString(),
      username: user.username,
      action: 'EXPORT_LOGS',
      entity: 'AUDIT',
      ip: req.ip,
      endpoint: req.originalUrl,
      details: { format, filters: { userId: filterByUserId, action: filterByAction, entity: filterByEntity } },
    });

    if (format === 'csv') {
      const csv = this.convertToCSV(logs);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${new Date().toISOString()}.csv`);
      return res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${new Date().toISOString()}.json`);
      return res.json(logs);
    }
  }

  private convertToCSV(logs: any[]): string {
    if (!logs.length) return '';
    
    const headers = ['Date', 'User ID', 'Username', 'Action', 'Entity', 'IP', 'Endpoint', 'Details'];
    const rows = logs.map(log => [
      new Date(log.createdAt).toISOString(),
      log.userId,
      log.username || '',
      log.action,
      log.entity,
      log.ip || '',
      log.endpoint || '',
      JSON.stringify(log.details || {}),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    return csvContent;
  }
  /* =========================
   DELETE LOGS BY DATE RANGE
   Rôle: ADMIN ou SUPER_ADMIN
========================= */
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Delete('by-date')
async deleteLogsByDateRange(
  @User() user: any,
  @Req() req: Request,
  @Query('startDate') startDate: string,
  @Query('endDate') endDate: string,
) {
  if (!startDate || !endDate) {
    throw new ForbiddenException('startDate and endDate are required');
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  const deletedCount = await this.auditService.deleteLogsByDateRange(start, end);
  
  await this.auditService.log({
    userId: user._id.toString(),
    username: user.username,
    action: 'DELETE_LOGS_BY_DATE',
    entity: 'AUDIT',
    ip: req.ip,
    endpoint: req.originalUrl,
    details: { startDate, endDate, deletedCount },
  });
  
  return { message: `${deletedCount} logs deleted`, deletedCount };
}

/* =========================
   GET LOGS BY MONTH
========================= */
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Get('by-month')
async getLogsByMonth(
  @Query('year') year: string,
  @Query('month') month: string,
) {
  const yearNum = parseInt(year);
  const monthNum = parseInt(month);
  
  const logs = await this.auditService.getLogsByMonth(yearNum, monthNum);
  const count = await this.auditService.getLogsCountByMonth(yearNum, monthNum);
  
  return { logs, count, year: yearNum, month: monthNum };
}
}