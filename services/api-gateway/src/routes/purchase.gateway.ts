import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import type { Request } from 'express';

// DTOs pour la création et mise à jour
interface CreatePurchaseDto {
  supplierId: string;
  items: { productId: string; quantity: number }[];
}

interface UpdatePurchaseDto {
  items?: { productId: string; quantity: number }[];
  status?: string;
}

// Interface représentant un achat (réponse du microservice)
interface Purchase {
  id: string;
  supplierId: string;
  items: { productId: string; quantity: number }[];
  totalAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Controller('purchases')
export class PurchasesGateway {
  private readonly PURCHASE_SERVICE_URL =
    process.env.PURCHASE_SERVICE_URL || 'http://localhost:3102';
  private readonly AUTH_SERVICE_URL =
    process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

  constructor() {
    Logger.log('PurchasesGateway chargé correctement', 'API-GATEWAY');
  }

  // Récupère le header Authorization ou lance une erreur
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

  // Gère les erreurs Axios
  private handleAxiosError(error: unknown, fallbackMessage: string): never {
    const err = error as AxiosError;
    throw new HttpException(
      err.response?.data || fallbackMessage,
      err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  // ✅ Fonction pour envoyer les logs à auth-service
  private async sendAuditLog(data: {
    userId: string;
    username: string;
    action: string;
    entity: string;
    ip?: string;
    endpoint?: string;
    details?: any;
  }) {
    try {
      await axios.post(`${this.AUTH_SERVICE_URL}/audits/remote-log`, data, {
        headers: { 'x-internal-token': process.env.INTERNAL_API_KEY || 'internal-secret' }
      });
    } catch (error) {
      Logger.error('Failed to send audit log', 'PurchasesGateway');
    }
  }

  // ---------------------------
  // POST /purchases
  // ---------------------------
  @Post()
  async create(
    @Body() body: CreatePurchaseDto,
    @Req() req: Request,
  ): Promise<Purchase> {
    try {
      const res = await axios.post<Purchase>(
        `${this.PURCHASE_SERVICE_URL}/purchases`,
        body,
        { headers: this.getAuthHeader(req) },
      );

      // ✅ Audit: Création achat
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'CREATE_PURCHASE',
          entity: 'PURCHASE',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || '/purchases',
          details: {
            purchaseId: res.data.id,
            supplierId: body.supplierId,
            itemsCount: body.items.length,
            totalAmount: res.data.totalAmount,
          },
        });
      }

      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur création achat');
    }
  }

  // ---------------------------
  // GET /purchases
  // ---------------------------
  @Get()
  async findAll(@Req() req: Request): Promise<Purchase[]> {
    try {
      const res = await axios.get<Purchase[]>(
        `${this.PURCHASE_SERVICE_URL}/purchases`,
        { headers: this.getAuthHeader(req) },
      );

      // ✅ Audit: Consultation liste achats
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'VIEW_ALL_PURCHASES',
          entity: 'PURCHASE',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || '/purchases',
          details: { count: res.data.length },
        });
      }

      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur récupération achats');
    }
  }

  // ---------------------------
  // GET /purchases/total
  // ---------------------------
  @Get('total')
  async getTotalPurchaseAmount(
    @Req() req: Request,
  ): Promise<{ totalPurchaseAmount: number }> {
    try {
      const res = await axios.get<{ totalPurchaseAmount: number }>(
        `${this.PURCHASE_SERVICE_URL}/purchases/total`,
        { headers: this.getAuthHeader(req) },
      );

      // ✅ Audit: Consultation total achats
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'VIEW_TOTAL_PURCHASE_AMOUNT',
          entity: 'PURCHASE',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || '/purchases/total',
          details: { totalPurchaseAmount: res.data.totalPurchaseAmount },
        });
      }

      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur récupération total achats');
    }
  }

  // ---------------------------
  // GET /purchases/:id
  // ---------------------------
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Purchase> {
    try {
      const res = await axios.get<Purchase>(
        `${this.PURCHASE_SERVICE_URL}/purchases/${id}`,
        { headers: this.getAuthHeader(req) },
      );

      // ✅ Audit: Consultation achat spécifique
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'VIEW_ONE_PURCHASE',
          entity: 'PURCHASE',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || `/purchases/${id}`,
          details: {
            purchaseId: id,
            totalAmount: res.data.totalAmount,
            itemsCount: res.data.items?.length,
          },
        });
      }

      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur récupération achat');
    }
  }

  // ---------------------------
  // PUT /purchases/:id
  // ---------------------------
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdatePurchaseDto,
    @Req() req: Request,
  ): Promise<Purchase> {
    try {
      const res = await axios.put<Purchase>(
        `${this.PURCHASE_SERVICE_URL}/purchases/${id}`,
        body,
        { headers: this.getAuthHeader(req) },
      );

      // ✅ Audit: Modification achat
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'UPDATE_PURCHASE',
          entity: 'PURCHASE',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || `/purchases/${id}`,
          details: {
            purchaseId: id,
            updatedFields: body,
          },
        });
      }

      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur mise à jour achat');
    }
  }

  // ---------------------------
  // DELETE /purchases/:id
  // ---------------------------
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Purchase> {
    try {
      const res = await axios.delete<Purchase>(
        `${this.PURCHASE_SERVICE_URL}/purchases/${id}`,
        { headers: this.getAuthHeader(req) },
      );

      // ✅ Audit: Suppression achat
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'DELETE_PURCHASE',
          entity: 'PURCHASE',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || `/purchases/${id}`,
          details: { purchaseId: id },
        });
      }

      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur suppression achat');
    }
  }

  // ---------------------------
  // DELETE /purchases?month=YYYY-MM
  // ---------------------------
  @Delete()
  async deleteByMonth(
    @Query('month') month: string,
    @Req() req: Request,
  ): Promise<{ deleted: number }> {
    try {
      const res = await axios.delete<{ deleted: number }>(
        `${this.PURCHASE_SERVICE_URL}/purchases?month=${month}`,
        { headers: this.getAuthHeader(req) },
      );

      // ✅ Audit: Suppression achats par mois
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'DELETE_PURCHASES_BY_MONTH',
          entity: 'PURCHASE',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || `/purchases?month=${month}`,
          details: { month, deletedCount: res.data.deleted },
        });
      }

      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur suppression achats par mois');
    }
  }
}