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

interface CreateOrderDto {
  customerId: string;
  products: { productId: string; quantity: number }[];
}

interface UpdateOrderDto {
  products?: { productId: string; quantity: number }[];
}

interface Order {
  id: string;
  customerId: string;
  products: { productId: string; quantity: number }[];
  status: string;
}

@Controller('orders')
export class OrdersGateway {
  private ORDERS_SERVICE_URL =
    process.env.ORDERS_SERVICE_URL || 'http://localhost:3002';

  constructor() {
    Logger.log('OrdersGateway chargé correctement', 'API-GATEWAY');
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

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateOrderDto,
    @Req() req: Request,
  ): Promise<Order> {
    try {
      const res = await axios.put<Order>(
        `${this.ORDERS_SERVICE_URL}/orders/${id}`,
        body,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur mise à jour commande',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request): Promise<Order> {
    try {
      const res = await axios.delete<Order>(
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
