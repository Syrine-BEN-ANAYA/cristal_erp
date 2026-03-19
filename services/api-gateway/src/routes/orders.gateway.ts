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
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur suppression commande');
    }
  }
}
