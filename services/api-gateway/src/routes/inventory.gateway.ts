import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import { AxiosError } from 'axios';
import type { Request } from 'express';

// DTOs et types
interface StockInDto {
  productId: string;
  quantity: number;
}

interface StockOutDto {
  productId: string;
  quantity: number;
}

interface InventoryItem {
  productId: string;
  quantity: number;
}

@Controller('inventory')
export class InventoryGateway {
  private CORE_SERVICE_URL =
    process.env.CORE_SERVICE_URL || 'http://localhost:3002';

  constructor() {
    Logger.log('InventoryGateway chargé correctement', 'API-GATEWAY');
  }

  // ---------------------------
  // POST /inventory/in → ajouter du stock
  // ---------------------------
  @Post('in')
  async stockIn(
    @Body() body: StockInDto,
    @Req() req: Request,
  ): Promise<InventoryItem> {
    try {
      const res = await axios.post<InventoryItem>(
        `${this.CORE_SERVICE_URL}/inventory/in`,
        body,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur stock in',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // POST /inventory/out → retirer du stock
  // ---------------------------
  @Post('out')
  async stockOut(
    @Body() body: StockOutDto,
    @Req() req: Request,
  ): Promise<InventoryItem> {
    try {
      const res = await axios.post<InventoryItem>(
        `${this.CORE_SERVICE_URL}/inventory/out`,
        body,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur stock out',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET /inventory/:productId → vérifier stock
  // ---------------------------
  @Get(':productId')
  async checkStock(
    @Param('productId') productId: string,
    @Req() req: Request,
  ): Promise<InventoryItem> {
    try {
      const res = await axios.get<InventoryItem>(
        `${this.CORE_SERVICE_URL}/inventory/${productId}`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur check stock',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET /inventory → lister tout le stock
  // ---------------------------
  @Get()
  async getAll(@Req() req: Request): Promise<InventoryItem[]> {
    try {
      const res = await axios.get<InventoryItem[]>(
        `${this.CORE_SERVICE_URL}/inventory`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur getAll stock',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // POST /inventory/rebuild → rebuild inventory
  // ---------------------------
  @Post('rebuild')
  async rebuild(@Req() req: Request): Promise<InventoryItem[]> {
    try {
      const res = await axios.post<InventoryItem[]>(
        `${this.CORE_SERVICE_URL}/inventory/rebuild`,
        {},
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur rebuild inventory',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
