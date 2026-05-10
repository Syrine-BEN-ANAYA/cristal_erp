import {
  Controller,
  Get,
  Delete,
  Query,
  Req,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import type { Request } from 'express';

interface AuditLog {
  _id: string;
  userId: string;
  username?: string;
  userEmail?: string;
  action: string;
  entity: string;
  ip?: string;
  endpoint?: string;
  details?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface StorageStats {
  totalLogs: number;
  oldestLogDate: string | null;
  newestLogDate: string | null;
  logsByMonth: Array<{ _id: { year: number; month: number }; count: number }>;
}

interface CleanupResult {
  deletedCount: number;
  reason: string;
}

@Controller('audits')
export class AuditGateway {
  private AUTH_SERVICE_URL =
    process.env.AUTH_SERVICE_URL || 'http://localhost:3101';

  constructor() {
    Logger.log('AuditGateway chargé correctement', 'API-GATEWAY');
  }

  private getAuthHeader(req: Request) {
    const auth = req.headers.authorization;
    if (!auth) {
      throw new HttpException(
        'Authorization header missing',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return { Authorization: auth };
  }

  private handleAxiosError(error: unknown, fallbackMessage: string): never {
    const err = error as AxiosError;
    throw new HttpException(
      err.response?.data || fallbackMessage,
      err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /* =========================
     GET CURRENT USER'S AUDIT LOGS
  ========================= */
  @Get('me')
  async getMyAudits(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResponse> {
    try {
      const pageNum = Math.max(1, parseInt(page || '1'));
      const limitNum = Math.min(100, parseInt(limit || '50'));

      const res = await axios.get<PaginatedResponse>(
        `${this.AUTH_SERVICE_URL}/audits/me`,
        {
          params: { page: pageNum, limit: limitNum },
          headers: this.getAuthHeader(req),
        },
      );
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur récupération de vos logs');
    }
  }

  /* =========================
     GET ALL AUDIT LOGS (ADMIN ONLY)
  ========================= */
  @Get()
  async getAllAudits(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') filterByUserId?: string,
    @Query('action') filterByAction?: string,
    @Query('entity') filterByEntity?: string,
  ): Promise<PaginatedResponse> {
    try {
      const pageNum = Math.max(1, parseInt(page || '1'));
      const limitNum = Math.min(100, parseInt(limit || '50'));

      const res = await axios.get<PaginatedResponse>(
        `${this.AUTH_SERVICE_URL}/audits`,
        {
          params: {
            page: pageNum,
            limit: limitNum,
            userId: filterByUserId,
            action: filterByAction,
            entity: filterByEntity,
          },
          headers: this.getAuthHeader(req),
        },
      );
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur récupération des logs');
    }
  }

  /* =========================
     GET AUDIT LOGS BY SPECIFIC USER (SUPER_ADMIN ONLY)
  ========================= */
  @Get('users/:targetUserId')
  async getUserAudits(
    @Req() req: Request,
    @Query('targetUserId') targetUserId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResponse> {
    try {
      const pageNum = Math.max(1, parseInt(page || '1'));
      const limitNum = Math.min(100, parseInt(limit || '50'));

      const res = await axios.get<PaginatedResponse>(
        `${this.AUTH_SERVICE_URL}/audits/users/${targetUserId}`,
        {
          params: { page: pageNum, limit: limitNum },
          headers: this.getAuthHeader(req),
        },
      );
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur récupération des logs utilisateur');
    }
  }

  /* =========================
     STORAGE MANAGEMENT (ADMIN ONLY)
  ========================= */

  // ✅ Obtenir les statistiques de stockage
  @Get('storage/stats')
  async getStorageStats(@Req() req: Request): Promise<StorageStats> {
    try {
      const res = await axios.get<StorageStats>(
        `${this.AUTH_SERVICE_URL}/audits/storage/stats`,
        { headers: this.getAuthHeader(req) },
      );
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur récupération des statistiques');
    }
  }

  // ✅ Compter le nombre total de logs
  @Get('storage/count')
  async countLogs(@Req() req: Request): Promise<{ count: number }> {
    try {
      const res = await axios.get<{ count: number }>(
        `${this.AUTH_SERVICE_URL}/audits/storage/count`,
        { headers: this.getAuthHeader(req) },
      );
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur comptage des logs');
    }
  }

  // ✅ Nettoyage automatique (SUPER_ADMIN only)
  @Delete('cleanup')
  async autoCleanup(@Req() req: Request): Promise<CleanupResult> {
    try {
      const res = await axios.delete<CleanupResult>(
        `${this.AUTH_SERVICE_URL}/audits/cleanup`,
        { headers: this.getAuthHeader(req) },
      );
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur lors du nettoyage');
    }
  }
  /* =========================
   DELETE LOGS BY DATE RANGE (ADMIN ONLY)
========================= */
  @Delete('by-date')
  async deleteLogsByDateRange(
    @Req() req: Request,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<{ message: string; deletedCount: number }> {
    try {
      const res = await axios.delete<{ message: string; deletedCount: number }>(
        `${this.AUTH_SERVICE_URL}/audits/by-date`,
        {
          params: { startDate, endDate },
          headers: this.getAuthHeader(req),
        },
      );
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur suppression des logs');
    }
  }

  @Get('by-month')
  async getLogsByMonth(
    @Req() req: Request,
    @Query('year') year: string,
    @Query('month') month: string,
  ): Promise<any> {
    try {
      const res = await axios.get(`${this.AUTH_SERVICE_URL}/audits/by-month`, {
        params: { year, month },
        headers: this.getAuthHeader(req),
      });
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur récupération des logs');
    }
  }
  // ✅ Réinitialiser tous les logs (SUPER_ADMIN only)
  @Delete('reset')
  async resetLogs(
    @Req() req: Request,
  ): Promise<{ message: string; deletedCount: number }> {
    try {
      const res = await axios.delete<{ message: string; deletedCount: number }>(
        `${this.AUTH_SERVICE_URL}/audits/reset`,
        { headers: this.getAuthHeader(req) },
      );
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur lors de la réinitialisation');
    }
  }

  /* =========================
     STATISTICS (ADMIN ONLY)
  ========================= */
  @Get('stats/actions')
  async getStatsByAction(@Req() req: Request): Promise<any> {
    try {
      const res = await axios.get(
        `${this.AUTH_SERVICE_URL}/audits/stats/actions`,
        { headers: this.getAuthHeader(req) },
      );
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur récupération des statistiques');
    }
  }

  @Get('stats/entities')
  async getStatsByEntity(@Req() req: Request): Promise<any> {
    try {
      const res = await axios.get(
        `${this.AUTH_SERVICE_URL}/audits/stats/entities`,
        { headers: this.getAuthHeader(req) },
      );
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur récupération des statistiques');
    }
  }

  /* =========================
     EXPORT LOGS (CSV/JSON)
  ========================= */
  @Get('export')
  async exportLogs(
    @Req() req: Request,
    @Query('format') format: 'csv' | 'json' = 'csv',
    @Query('userId') filterByUserId?: string,
    @Query('action') filterByAction?: string,
    @Query('entity') filterByEntity?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    try {
      const res = await axios.get(`${this.AUTH_SERVICE_URL}/audits/export`, {
        params: {
          format,
          userId: filterByUserId,
          action: filterByAction,
          entity: filterByEntity,
          startDate,
          endDate,
        },
        headers: this.getAuthHeader(req),
        responseType: format === 'csv' ? 'blob' : 'json',
      });
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur export des logs');
    }
  }
}
