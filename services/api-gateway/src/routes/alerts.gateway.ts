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
import axios, { AxiosError } from 'axios';
import type { Request } from 'express';

interface SetAlertDto {
  productId: string;
  threshold: number;
}

interface Alert {
  productId: string;
  threshold: number;
}

@Controller('alerts')
export class AlertsGateway {
  private ALERTS_SERVICE_URL =
    process.env.ALERTS_SERVICE_URL || 'http://localhost:3002';

  constructor() {
    Logger.log('AlertsGateway chargé correctement', 'API-GATEWAY');
  }

  @Post()
  async setAlert(
    @Body() body: SetAlertDto,
    @Req() req: Request,
  ): Promise<Alert> {
    try {
      const res = await axios.post<Alert>(
        `${this.ALERTS_SERVICE_URL}/alerts`,
        body,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur création alerte',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(@Req() req: Request): Promise<Alert[]> {
    try {
      const res = await axios.get<Alert[]>(
        `${this.ALERTS_SERVICE_URL}/alerts`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur récupération alertes',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':productId')
  async findOne(
    @Param('productId') productId: string,
    @Req() req: Request,
  ): Promise<Alert> {
    try {
      const res = await axios.get<Alert>(
        `${this.ALERTS_SERVICE_URL}/alerts/${productId}`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur récupération alerte',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':productId')
  async delete(
    @Param('productId') productId: string,
    @Req() req: Request,
  ): Promise<Alert> {
    try {
      const res = await axios.delete<Alert>(
        `${this.ALERTS_SERVICE_URL}/alerts/${productId}`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur suppression alerte',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
