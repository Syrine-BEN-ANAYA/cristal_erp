import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import axios, { AxiosError } from 'axios';
import type { Request } from 'express';

// =====================================================
// CONFIG
// =====================================================
@Controller('users')
export class UsersGateway {
  private readonly USERS_SERVICE =
    process.env.USERS_SERVICE_URL || 'http://localhost:3101';

  constructor() {
    Logger.log('UsersGateway loaded', 'API-GATEWAY');
  }

  // =====================================================
  // ERROR HANDLER
  // =====================================================
  private handleError(error: AxiosError, msg: string): never {
    const message =
      (error.response?.data as any)?.message ||
      error.message ||
      msg;

    throw new HttpException(
      message,
      error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  // =====================================================
  // HEADERS (JWT forward)
  // =====================================================
  private headers(req: Request) {
    return {
      Authorization: req.headers.authorization || '',
    };
  }

  // =====================================================
  // GET ALL USERS
  // =====================================================
  @Get()
  async findAll(@Req() req: Request) {
    try {
      const { data } = await axios.get(
        `${this.USERS_SERVICE}/users`,
        { headers: this.headers(req) },
      );
      return data;
    } catch (error) {
      this.handleError(error as AxiosError, 'Error fetching users');
    }
  }

  // =====================================================
  // GET ONE USER
  // =====================================================
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    try {
      const { data } = await axios.get(
        `${this.USERS_SERVICE}/users/${id}`,
        { headers: this.headers(req) },
      );
      return data;
    } catch (error) {
      this.handleError(error as AxiosError, 'Error fetching user');
    }
  }

  // =====================================================
  // CREATE NORMAL USER
  // =====================================================
  @Post()
  async create(@Body() dto: any, @Req() req: Request) {
    try {
      const { data } = await axios.post(
        `${this.USERS_SERVICE}/users`,
        dto,
        { headers: this.headers(req) },
      );
      return data;
    } catch (error) {
      this.handleError(error as AxiosError, 'Error creating user');
    }
  }

  // =====================================================
  // CREATE USER FROM EMPLOYEE (IMPORTANT FLOW)
  // =====================================================
  @Post('from-employee/:employeeId')
  async createFromEmployee(
    @Param('employeeId') employeeId: string,
    @Body() dto: any,
    @Req() req: Request,
  ) {
    try {
      const { data } = await axios.post(
        `${this.USERS_SERVICE}/users/from-employee/${employeeId}`,
        dto,
        { headers: this.headers(req) },
      );

      return data;
    } catch (error) {
      this.handleError(
        error as AxiosError,
        'Error creating user from employee',
      );
    }
  }

  // =====================================================
  // UPDATE USER
  // =====================================================
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: Request,
  ) {
    try {
      const { data } = await axios.put(
        `${this.USERS_SERVICE}/users/${id}`,
        dto,
        { headers: this.headers(req) },
      );
      return data;
    } catch (error) {
      this.handleError(error as AxiosError, 'Error updating user');
    }
  }

  // =====================================================
  // DELETE USER
  // =====================================================
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    try {
      const { data } = await axios.delete(
        `${this.USERS_SERVICE}/users/${id}`,
        { headers: this.headers(req) },
      );
      return data;
    } catch (error) {
      this.handleError(error as AxiosError, 'Error deleting user');
    }
  }

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================
  @Put('change-password/:id')
  async changePassword(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: Request,
  ) {
    try {
      const { data } = await axios.put(
        `${this.USERS_SERVICE}/users/change-password/${id}`,
        dto,
        { headers: this.headers(req) },
      );
      return data;
    } catch (error) {
      this.handleError(error as AxiosError, 'Error changing password');
    }
  }

  // =====================================================
  // FORCE PASSWORD RESET
  // =====================================================
  @Put('force-reset/:id')
  async forceReset(@Param('id') id: string, @Req() req: Request) {
    try {
      const { data } = await axios.put(
        `${this.USERS_SERVICE}/users/force-change-password/${id}`,
        {},
        { headers: this.headers(req) },
      );
      return data;
    } catch (error) {
      this.handleError(error as AxiosError, 'Error forcing password reset');
    }
  }
}
