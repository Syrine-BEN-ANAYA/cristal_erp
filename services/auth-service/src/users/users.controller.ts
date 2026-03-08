import {
  Controller,
  Get,
  Post,
  Put,
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

// Typage DTOs et réponses
interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role: string;
}

interface UpdateUserDto {
  username?: string;
  email?: string;
  role?: string;
}

interface ChangePasswordDto {
  password: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  mustChangePassword?: boolean;
  tempPassword?: string;
}

@Controller('users')
export class UsersController {
  private AUTH_SERVICE_URL =
    process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

  constructor() {
    Logger.log('UsersGateway chargé correctement', 'API-GATEWAY');
  }

  // ---------------------------
  // GET /users
  // ---------------------------
  @Get()
  async findAll(@Req() req: Request): Promise<User[]> {
    try {
      const res = await axios.get<User[]>(`${this.AUTH_SERVICE_URL}/users`, {
        headers: { Authorization: req.headers.authorization || '' },
      });
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur récupération users',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET /users/:id
  // ---------------------------
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request): Promise<User> {
    try {
      const res = await axios.get<User>(`${this.AUTH_SERVICE_URL}/users/${id}`, {
        headers: { Authorization: req.headers.authorization || '' },
      });
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur récupération user',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // POST /users
  // ---------------------------
  @Post()
  async create(@Body() body: CreateUserDto, @Req() req: Request): Promise<User> {
    try {
      const res = await axios.post<User>(`${this.AUTH_SERVICE_URL}/users`, body, {
        headers: { Authorization: req.headers.authorization || '' },
      });
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur création user',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // PUT /users/:id
  // ---------------------------
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @Req() req: Request,
  ): Promise<User> {
    try {
      const res = await axios.put<User>(
        `${this.AUTH_SERVICE_URL}/users/${id}`,
        body,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur update user',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // DELETE /users/:id
  // ---------------------------
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request): Promise<User> {
    try {
      const res = await axios.delete<User>(`${this.AUTH_SERVICE_URL}/users/${id}`, {
        headers: { Authorization: req.headers.authorization || '' },
      });
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur suppression user',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // PUT /users/change-password/:id
  // ---------------------------
  @Put('change-password/:id')
  async changePassword(
    @Param('id') id: string,
    @Body() body: ChangePasswordDto,
    @Req() req: Request,
  ): Promise<User> {
    try {
      const res = await axios.put<User>(
        `${this.AUTH_SERVICE_URL}/users/change-password/${id}`,
        body,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur changement mot de passe',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}