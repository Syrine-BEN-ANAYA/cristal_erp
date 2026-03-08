import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import axios from 'axios';

// DTO
interface SetAlertDto {
  productId: string;
  threshold: number;
}

// Model
interface Alert {
  productId: string;
  threshold: number;
}

@Controller('alerts')
export class AlertsGateway {
  private readonly ALERTS_SERVICE_URL =
    process.env.ALERTS_SERVICE_URL || 'http://localhost:3002';

  constructor() {
    Logger.log('AlertsGateway chargé correctement', 'API-GATEWAY');
  }

  // ---------------- CREATE ALERT ----------------
  @Post()
  async setAlert(
    @Body() body: SetAlertDto,
    @Req() req: Request,
  ): Promise<Alert> {
    try {
      const res = await axios.post<Alert>(
        `${this.ALERTS_SERVICE_URL}/alerts`,
        body,
        {
          headers: { Authorization: req.headers.authorization || '' },
        },
      );

      return res.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data ?? 'Erreur création alerte',
          error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        'Erreur interne',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------- GET ALL ALERTS ----------------
  @Get()
  async findAll(@Req() req: Request): Promise<Alert[]> {
    try {
      const res = await axios.get<Alert[]>(
        `${this.ALERTS_SERVICE_URL}/alerts`,
        {
          headers: { Authorization: req.headers.authorization || '' },
        },
      );

      return res.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data ?? 'Erreur récupération alertes',
          error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        'Erreur interne',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------- GET ONE ALERT ----------------
  @Get(':productId')
  async findOne(
    @Param('productId') productId: string,
    @Req() req: Request,
  ): Promise<Alert> {
    try {
      const res = await axios.get<Alert>(
        `${this.ALERTS_SERVICE_URL}/alerts/${productId}`,
        {
          headers: { Authorization: req.headers.authorization || '' },
        },
      );

      return res.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data ?? 'Erreur récupération alerte',
          error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        'Erreur interne',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------- DELETE ALERT ----------------
  @Delete(':productId')
  async delete(
    @Param('productId') productId: string,
    @Req() req: Request,
  ): Promise<Alert> {
    try {
      const res = await axios.delete<Alert>(
        `${this.ALERTS_SERVICE_URL}/alerts/${productId}`,
        {
          headers: { Authorization: req.headers.authorization || '' },
        },
      );

      return res.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data ?? 'Erreur suppression alerte',
          error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        'Erreur interne',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
