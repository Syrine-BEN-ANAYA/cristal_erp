import {
  Controller,
  Get,
  Post,
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

interface CreateOrderDto {
  customerId: string;
  items: { productId: string; quantity: number }[];
}

interface Order {
  id: string;
  customerId: string;
  items: { productId: string; quantity: number }[];
  status?: string;
  createdAt?: string;
}

@Controller('orders')
export class OrdersGateway {
  private ORDERS_SERVICE_URL =
    process.env.ORDERS_SERVICE_URL || 'http://localhost:3102';

  constructor() {
    Logger.log('OrdersGateway chargé correctement', 'API-GATEWAY');
  }

  // Helper pour récupérer le header Authorization
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

  // Helper pour gérer les erreurs Axios
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
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur création commande',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(@Req() req: Request): Promise<Order[]> {
    try {
      const res = await axios.get<Order[]>(
        `${this.ORDERS_SERVICE_URL}/orders`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur récupération commandes',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
    } catch (error) {
      this.handleAxiosError(error, 'Erreur récupération total commandes');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request): Promise<Order> {
    try {
      const res = await axios.get<Order>(
        `${this.ORDERS_SERVICE_URL}/orders/${id}`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur récupération commande',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur suppression commande',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete()
  async deleteByMonth(
    @Query('month') month: string,
    @Req() req: Request,
  ): Promise<{ deleted: number }> {
    try {
      const res = await axios.delete<{ deleted: number }>(
        `${this.ORDERS_SERVICE_URL}/orders?month=${month}`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur suppression commandes par mois',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
