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

/* -------------------------------------------------------------------------- */
/*                                    DTOs                                    */
/* -------------------------------------------------------------------------- */

interface CreatePurchaseDto {
  supplierId: string;

  items: {
    productId: string;
    quantity: number;
    price?: number;
  }[];
}

interface UpdatePurchaseDto {
  items?: {
    productId: string;
    quantity: number;
    price?: number;
  }[];

  status?: string;
}

/* -------------------------------------------------------------------------- */
/*                                  Interfaces                                */
/* -------------------------------------------------------------------------- */

interface Purchase {
  _id?: string;
  id?: string;

  supplierId: string;

  items: {
    productId: string;
    quantity: number;
    price?: number;
  }[];

  totalAmount?: number;

  createdAt?: string;
  updatedAt?: string;
}

/* -------------------------------------------------------------------------- */
/*                               PURCHASES GATEWAY                            */
/* -------------------------------------------------------------------------- */

@Controller('purchases')
export class PurchasesGateway {

  private readonly PURCHASE_SERVICE_URL =
    process.env.PURCHASE_SERVICE_URL || 'http://localhost:3102';

  private readonly AUTH_SERVICE_URL =
    process.env.AUTH_SERVICE_URL || 'http://localhost:3101';

  private readonly axiosConfig = {
    timeout: 10000,
  };

  constructor() {
    Logger.log(
      `PurchasesGateway started`,
      'API-GATEWAY',
    );

    Logger.log(
      `Purchase Service URL: ${this.PURCHASE_SERVICE_URL}`,
      'API-GATEWAY',
    );

    Logger.log(
      `Auth Service URL: ${this.AUTH_SERVICE_URL}`,
      'API-GATEWAY',
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                AUTH HEADER                                 */
  /* -------------------------------------------------------------------------- */

  private getAuthHeader(req: Request) {
    const auth = req.headers.authorization;

    if (!auth) {
      throw new HttpException(
        'Authorization header missing',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      Authorization: auth,
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                               HANDLE ERRORS                                */
  /* -------------------------------------------------------------------------- */

  private handleAxiosError(
    error: unknown,
    fallbackMessage: string,
  ): never {

    const err = error as AxiosError<any>;

    Logger.error(
      err?.response?.data || err.message,
      'PurchasesGateway',
    );

    const message =
      typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || fallbackMessage;

    throw new HttpException(
      message,
      err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                AUDIT LOGGER                                */
  /* -------------------------------------------------------------------------- */

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

      await axios.post(
        `${this.AUTH_SERVICE_URL}/audits/remote-log`,
        data,
        {
          headers: {
            'x-internal-token':
              process.env.INTERNAL_API_KEY || 'internal-secret',
          },

          timeout: 5000,
        },
      );

    } catch (error) {

      Logger.error(
        'Failed to send audit log',
        'PurchasesGateway',
      );
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                              CREATE PURCHASE                               */
  /* -------------------------------------------------------------------------- */

  @Post()
  async create(
    @Body() body: CreatePurchaseDto,
    @Req() req: Request,
  ): Promise<Purchase> {

    try {

      const res = await axios.post<Purchase>(
        `${this.PURCHASE_SERVICE_URL}/purchases`,
        body,
        {
          headers: this.getAuthHeader(req),
          timeout: 10000,
        },
      );

      const purchaseId =
        res.data._id ||
        res.data.id;

      const user = (req as any).user;

      if (user) {

        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,

          action: 'CREATE_PURCHASE',
          entity: 'PURCHASE',

          ip: req.ip || req.socket?.remoteAddress,

          endpoint:
            req.originalUrl || '/purchases',

          details: {
            purchaseId,
            supplierId: body.supplierId,
            itemsCount: body.items.length,
            totalAmount: res.data.totalAmount,
          },
        });
      }

      return res.data;

    } catch (error) {

      this.handleAxiosError(
        error,
        'Erreur création achat',
      );
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                               GET ALL PURCHASES                            */
  /* -------------------------------------------------------------------------- */

  @Get()
  async findAll(
    @Req() req: Request,
  ): Promise<Purchase[]> {

    try {

      const res = await axios.get<Purchase[]>(
        `${this.PURCHASE_SERVICE_URL}/purchases`,
        {
          headers: this.getAuthHeader(req),
          timeout: 10000,
        },
      );

      const user = (req as any).user;

      if (user) {

        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,

          username:
            user.username || user.email,

          action: 'VIEW_ALL_PURCHASES',

          entity: 'PURCHASE',

          ip:
            req.ip || req.socket?.remoteAddress,

          endpoint:
            req.originalUrl || '/purchases',

          details: {
            count: res.data.length,
          },
        });
      }

      return res.data;

    } catch (error) {

      this.handleAxiosError(
        error,
        'Erreur récupération achats',
      );
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                           TOTAL PURCHASE AMOUNT                            */
  /* -------------------------------------------------------------------------- */

  @Get('total')
  async getTotalPurchaseAmount(
    @Req() req: Request,
  ): Promise<{ totalPurchaseAmount: number }> {

    try {

      const res = await axios.get<{
        totalPurchaseAmount: number;
      }>(
        `${this.PURCHASE_SERVICE_URL}/purchases/total`,
        {
          headers: this.getAuthHeader(req),
          timeout: 10000,
        },
      );

      const user = (req as any).user;

      if (user) {

        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,

          username:
            user.username || user.email,

          action: 'VIEW_TOTAL_PURCHASE_AMOUNT',

          entity: 'PURCHASE',

          ip:
            req.ip || req.socket?.remoteAddress,

          endpoint:
            req.originalUrl || '/purchases/total',

          details: {
            totalPurchaseAmount:
              res.data.totalPurchaseAmount,
          },
        });
      }

      return res.data;

    } catch (error) {

      this.handleAxiosError(
        error,
        'Erreur récupération total achats',
      );
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                               GET ONE PURCHASE                             */
  /* -------------------------------------------------------------------------- */

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Purchase> {

    try {

      const res = await axios.get<Purchase>(
        `${this.PURCHASE_SERVICE_URL}/purchases/${id}`,
        {
          headers: this.getAuthHeader(req),
          timeout: 10000,
        },
      );

      const user = (req as any).user;

      if (user) {

        await this.sendAuditLog({
          userId:
            user._id?.toString() || user.id,

          username:
            user.username || user.email,

          action: 'VIEW_ONE_PURCHASE',

          entity: 'PURCHASE',

          ip:
            req.ip || req.socket?.remoteAddress,

          endpoint:
            req.originalUrl ||
            `/purchases/${id}`,

          details: {
            purchaseId: id,

            totalAmount:
              res.data.totalAmount,

            itemsCount:
              res.data.items?.length,
          },
        });
      }

      return res.data;

    } catch (error) {

      this.handleAxiosError(
        error,
        'Erreur récupération achat',
      );
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                              UPDATE PURCHASE                               */
  /* -------------------------------------------------------------------------- */

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
        {
          headers: this.getAuthHeader(req),
          timeout: 10000,
        },
      );

      const user = (req as any).user;

      if (user) {

        await this.sendAuditLog({
          userId:
            user._id?.toString() || user.id,

          username:
            user.username || user.email,

          action: 'UPDATE_PURCHASE',

          entity: 'PURCHASE',

          ip:
            req.ip || req.socket?.remoteAddress,

          endpoint:
            req.originalUrl ||
            `/purchases/${id}`,

          details: {
            purchaseId: id,
            updatedFields: body,
          },
        });
      }

      return res.data;

    } catch (error) {

      this.handleAxiosError(
        error,
        'Erreur mise à jour achat',
      );
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                              DELETE PURCHASE                               */
  /* -------------------------------------------------------------------------- */

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<any> {

    try {

      const res = await axios.delete(
        `${this.PURCHASE_SERVICE_URL}/purchases/${id}`,
        {
          headers: this.getAuthHeader(req),
          timeout: 10000,
        },
      );

      const user = (req as any).user;

      if (user) {

        await this.sendAuditLog({
          userId:
            user._id?.toString() || user.id,

          username:
            user.username || user.email,

          action: 'DELETE_PURCHASE',

          entity: 'PURCHASE',

          ip:
            req.ip || req.socket?.remoteAddress,

          endpoint:
            req.originalUrl ||
            `/purchases/${id}`,

          details: {
            purchaseId: id,
          },
        });
      }

      return res.data;

    } catch (error) {

      this.handleAxiosError(
        error,
        'Erreur suppression achat',
      );
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                         DELETE PURCHASES BY MONTH                          */
  /* -------------------------------------------------------------------------- */

  @Delete()
  async deleteByMonth(
    @Query('month') month: string,
    @Req() req: Request,
  ): Promise<{ deleted: number }> {

    try {

      if (
        !month ||
        !/^\d{4}-\d{2}$/.test(month)
      ) {
        throw new HttpException(
          'Invalid month format. Use YYYY-MM',
          HttpStatus.BAD_REQUEST,
        );
      }

      const res = await axios.delete<{
        deleted: number;
      }>(
        `${this.PURCHASE_SERVICE_URL}/purchases?month=${month}`,
        {
          headers: this.getAuthHeader(req),
          timeout: 10000,
        },
      );

      const user = (req as any).user;

      if (user) {

        await this.sendAuditLog({
          userId:
            user._id?.toString() || user.id,

          username:
            user.username || user.email,

          action: 'DELETE_PURCHASES_BY_MONTH',

          entity: 'PURCHASE',

          ip:
            req.ip || req.socket?.remoteAddress,

          endpoint:
            req.originalUrl ||
            `/purchases?month=${month}`,

          details: {
            month,
            deletedCount: res.data.deleted,
          },
        });
      }

      return res.data;

    } catch (error) {

      this.handleAxiosError(
        error,
        'Erreur suppression achats par mois',
      );
    }
  }
}