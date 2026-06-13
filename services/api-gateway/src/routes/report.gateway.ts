import {
  Controller,
  Get,
  Req,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import type { Request } from 'express';

@Controller('report')
export class ReportGateway {
  private readonly CORE_SERVICE_URL =
    process.env.CORE_SERVICE_URL || 'http://localhost:3102';

  constructor() {
    Logger.log('ReportGateway chargé correctement', 'API-GATEWAY');
  }

  private handleAxiosError(err: AxiosError, defaultMsg: string): never {
    const errResponse = err.response?.data;
    let message = defaultMsg;

    if (errResponse) {
      if (typeof errResponse === 'string') message = errResponse;
      else if ((errResponse as any).message)
        message = (errResponse as any).message;
      else message = JSON.stringify(errResponse, null, 2);
    } else if (err.message) {
      message = err.message;
    }

    throw new HttpException(
      message,
      err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private getHeaders(req: Request) {
    return { Authorization: req.headers.authorization || '' };
  }

  // -------------------- GLOBAL REPORT --------------------
  @Get()
  async getGlobalReport(@Req() req: Request): Promise<any> {
    try {
      const response = await axios.get(`${this.CORE_SERVICE_URL}/report`, {
        headers: this.getHeaders(req),
      });

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la récupération du report global',
      );
    }
  }
}
