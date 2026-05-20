import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import axios, { AxiosError } from 'axios';
import type { Request } from 'express';

@Controller('ai')
export class AiGateway {
  private CORE_SERVICE_URL =
    process.env.CORE_SERVICE_URL || 'http://localhost:3102';

  // ================= ASK AI =================
  @Post('ask')
  async ask(@Body() body: { question: string }, @Req() req: Request) {
    try {
      const response = await axios.post(
        `${this.CORE_SERVICE_URL}/ai/ask`,
        body,
        {
          headers: {
            Authorization: req.headers.authorization || '',
          },
        },
      );

      return response.data;
    } catch (error) {
      const err = error as AxiosError;

      console.error('AI GATEWAY ERROR:', err.response?.data || err.message);

      throw new HttpException(
        err.response?.data || 'AI Service Error',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
