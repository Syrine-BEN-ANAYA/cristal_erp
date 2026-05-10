import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  HttpException,
  HttpStatus,
  Logger,
  Put,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import type { Request } from 'express';

interface OrderItem {
  productId: string;
  quantity: number;
}

interface CreateOrderDto {
  customerId: string;
  items: OrderItem[];
}

interface UpdateOrderDto {
  customerId: string;
  items: OrderItem[];
}

interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  totalAmount?: number;
  createdAt?: string;
}

@Controller('orders')
export class OrdersGateway {
  private ORDERS_SERVICE_URL =
    process.env.ORDERS_SERVICE_URL || 'http://localhost:3102';
  private AUTH_SERVICE_URL =
    process.env.AUTH_SERVICE_URL || 'http://localhost:3101';

  constructor() {
    Logger.log('OrdersGateway chargé correctement', 'API-GATEWAY');
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
        headers: {
          'x-internal-token': process.env.INTERNAL_API_KEY || 'internal-secret',
        },
      });
    } catch (error) {
      Logger.error('Failed to send audit log', 'OrdersGateway');
    }
  }

  @Post()
  async create(
    @Body() body: CreateOrderDto,
    @Req() req: Request,
  ): Promise<Order> {
    try {
      const res = await axios.post<Order>(
        `${this.ORDERS_SERVICE_URL}/orders`,
        body,
        { headers: this.getAuthHeader(req) },
      );

      // ✅ Audit: Création commande
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'CREATE_ORDER',
          entity: 'ORDER',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || '/orders',
          details: {
            orderId: res.data.id,
            customerId: body.customerId,
            itemsCount: body.items.length,
            totalAmount: res.data.totalAmount,
          },
        });
      }

      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur création commande');
    }
  }

  @Get('total')
  async getTotalOrderAmount(
    @Req() req: Request,
  ): Promise<{ totalOrderAmount: number }> {
    try {
      const res = await axios.get<{ totalOrderAmount: number }>(
        `${this.ORDERS_SERVICE_URL}/orders/total`,
        { headers: this.getAuthHeader(req) },
      );

      // ✅ Audit: Consultation total commandes
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'VIEW_TOTAL_REVENUE',
          entity: 'ORDER',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || '/orders/total',
          details: { totalOrderAmount: res.data.totalOrderAmount },
        });
      }

      return res.data;
    } catch (err) {
      this.handleAxiosError(err, 'Erreur récupération total commandes');
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateOrderDto,
    @Req() req: Request,
  ): Promise<Order> {
    try {
      // Vérifie que items est bien un tableau
      if (!Array.isArray(body.items) || body.items.length === 0) {
        throw new HttpException(
          'Le champ items doit être un tableau non vide',
          HttpStatus.BAD_REQUEST,
        );
      }

      const res = await axios.put<Order>(
        `${this.ORDERS_SERVICE_URL}/orders/${id}`,
        body,
        { headers: this.getAuthHeader(req) },
      );

      // ✅ Audit: Modification commande
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'UPDATE_ORDER',
          entity: 'ORDER',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || `/orders/${id}`,
          details: {
            orderId: id,
            customerId: body.customerId,
            itemsCount: body.items.length,
            totalAmount: res.data.totalAmount,
          },
        });
      }

      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur mise à jour commande');
    }
  }

  @Get()
  async findAll(@Req() req: Request): Promise<Order[]> {
    try {
      const res = await axios.get<Order[]>(
        `${this.ORDERS_SERVICE_URL}/orders`,
        { headers: this.getAuthHeader(req) },
      );

      // ✅ Audit: Consultation liste commandes
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'VIEW_ALL_ORDERS',
          entity: 'ORDER',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || '/orders',
          details: { count: res.data.length },
        });
      }

      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur récupération commandes');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request): Promise<Order> {
    try {
      const res = await axios.get<Order>(
        `${this.ORDERS_SERVICE_URL}/orders/${id}`,
        { headers: this.getAuthHeader(req) },
      );

      // ✅ Audit: Consultation commande spécifique
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'VIEW_ONE_ORDER',
          entity: 'ORDER',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || `/orders/${id}`,
          details: {
            orderId: id,
            totalAmount: res.data.totalAmount,
          },
        });
      }

      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur récupération commande');
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    try {
      const res = await axios.delete<{ message: string }>(
        `${this.ORDERS_SERVICE_URL}/orders/${id}`,
        { headers: this.getAuthHeader(req) },
      );

      // ✅ Audit: Suppression commande
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'DELETE_ORDER',
          entity: 'ORDER',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || `/orders/${id}`,
          details: { orderId: id },
        });
      }

      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur suppression commande');
    }
  }
}
