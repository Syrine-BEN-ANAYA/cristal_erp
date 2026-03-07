import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import type { Request } from 'express';

// Typage des DTOs
interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  username: string;
  email: string;
  password: string;
  role: string;
}

// Typage de la réponse login
interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

// Typage de la réponse register
interface RegisterResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

@Controller('auth')
export class AuthGateway {
  private AUTH_SERVICE_URL =
    process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

  constructor() {
    Logger.log('AuthGateway chargé correctement', 'API-GATEWAY');
  }

  // ---------------------------
  // LOGIN → forward vers auth-service
  // ---------------------------
  @Post('login')
  async login(@Body() body: LoginDto): Promise<LoginResponse> {
    try {
      const res = await axios.post<LoginResponse>(
        `${this.AUTH_SERVICE_URL}/auth/login`,
        body,
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur login',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // REGISTER → nécessite JWT pour vérifier rôle
  // ---------------------------
  @Post('register')
  async register(
    @Body() body: RegisterDto,
    @Req() req: Request,
  ): Promise<RegisterResponse> {
    try {
      const res = await axios.post<RegisterResponse>(
        `${this.AUTH_SERVICE_URL}/auth/register`,
        body,
        {
          headers: { Authorization: req.headers.authorization || '' },
        },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur register',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
