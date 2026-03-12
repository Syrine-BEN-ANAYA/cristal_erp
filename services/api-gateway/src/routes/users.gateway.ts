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

interface ChangePasswordDto {
  newPassword: string;
}

// 🔹 Type minimal pour un utilisateur
interface User {
  _id: string;
  username: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  mustChangePassword: boolean;
  tempPassword?: string; // si création USER/Manager
}

@Controller('users')
export class UsersGateway {
  private AUTH_SERVICE_URL =
    process.env.AUTH_SERVICE_URL || 'http://localhost:3101';

  constructor() {
    Logger.log('UsersGateway chargé correctement', 'API-GATEWAY');
  }

  // ---------------------------
  // GET ALL USERS
  // ---------------------------
  @Get()
  async getAllUsers(@Req() req: Request): Promise<User[]> {
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
  // GET USER BY ID
  // ---------------------------
  @Get(':id')
  async getUser(@Param('id') id: string, @Req() req: Request): Promise<User> {
    try {
      const res = await axios.get<User>(
        `${this.AUTH_SERVICE_URL}/users/${id}`,
        {
          headers: { Authorization: req.headers.authorization || '' },
        },
      );

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
  // CREATE USER
  // ---------------------------
  @Post()
  async createUser(
    @Body() body: Partial<User>,
    @Req() req: Request,
  ): Promise<User> {
    try {
      const res = await axios.post<User>(
        `${this.AUTH_SERVICE_URL}/users`,
        body,
        {
          headers: { Authorization: req.headers.authorization || '' },
        },
      );

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
  // UPDATE USER
  // ---------------------------
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: Partial<User>,
    @Req() req: Request,
  ): Promise<User> {
    try {
      const res = await axios.put<User>(
        `${this.AUTH_SERVICE_URL}/users/${id}`,
        body,
        {
          headers: { Authorization: req.headers.authorization || '' },
        },
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
  // DELETE USER
  // ---------------------------
  @Delete(':id')
  async deleteUser(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    try {
      const res = await axios.delete<{ message: string }>(
        `${this.AUTH_SERVICE_URL}/users/${id}`,
        {
          headers: { Authorization: req.headers.authorization || '' },
        },
      );

      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur suppression user',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Put('change-password/:id')
  async changePassword(
    @Param('id') id: string,
    @Body() body: ChangePasswordDto,
    @Req() req: Request,
  ): Promise<any> {
    try {
      const res = await axios.put(
        `${this.AUTH_SERVICE_URL}/users/change-password/${id}`,
        body,
        { headers: { Authorization: req.headers.authorization } },
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
