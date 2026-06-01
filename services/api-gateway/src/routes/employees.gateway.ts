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
@Controller('employees')
export class EmployeesGateway {
  private readonly HR_SERVICE =
    process.env.HR_SERVICE_URL || 'http://localhost:3106';

  constructor() {
    Logger.log('EmployeesGateway loaded', 'API-GATEWAY');
  }

  // =====================================================
  // ERROR HANDLER
  // =====================================================
  private handleError(error: AxiosError, msg: string): never {
    const message =
      (error.response?.data as any)?.message || error.message || msg;

    throw new HttpException(
      message,
      error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  // =====================================================
  // HEADERS
  // =====================================================
  private headers(req: Request) {
    return {
      Authorization: req.headers.authorization || '',
    };
  }

  // =====================================================
  // CREATE EMPLOYEE
  // =====================================================
  @Post()
  async create(@Body() dto: any, @Req() req: Request) {
    try {
      const { data } = await axios.post(
        `${this.HR_SERVICE}/employees`,
        dto,
        { headers: this.headers(req) },
      );
      return data;
    } catch (error) {
      this.handleError(error as AxiosError, 'Error creating employee');
    }
  }

  // =====================================================
  // GET ALL EMPLOYEES
  // =====================================================
  @Get()
  async findAll(@Req() req: Request) {
    try {
      const { data } = await axios.get(
        `${this.HR_SERVICE}/employees`,
        { headers: this.headers(req) },
      );
      return data;
    } catch (error) {
      this.handleError(error as AxiosError, 'Error fetching employees');
    }
  }

  // =====================================================
  // GET ONE EMPLOYEE
  // =====================================================
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    try {
      const { data } = await axios.get(
        `${this.HR_SERVICE}/employees/${id}`,
        { headers: this.headers(req) },
      );
      return data;
    } catch (error) {
      this.handleError(error as AxiosError, 'Error fetching employee');
    }
  }

  // =====================================================
  // UPDATE EMPLOYEE (ADMIN / SYSTEM)
  // =====================================================
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: Request,
  ) {
    try {
      const { data } = await axios.put(
        `${this.HR_SERVICE}/employees/${id}`,
        dto,
        { headers: this.headers(req) },
      );
      return data;
    } catch (error) {
      this.handleError(error as AxiosError, 'Error updating employee');
    }
  }

  // =====================================================
  // HR UPDATE (restricted rule)
  // =====================================================
  @Put('hr/:id')
  async updateHr(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: Request,
  ) {
    try {
      const { data } = await axios.put(
        `${this.HR_SERVICE}/employees/hr/${id}`,
        dto,
        { headers: this.headers(req) },
      );
      return data;
    } catch (error) {
      this.handleError(error as AxiosError, 'Error HR update employee');
    }
  }

  // =====================================================
  // PENDING EMPLOYEES (requested)
  // =====================================================
  @Get('accounts/pending')
  async findPending(@Req() req: Request) {
    try {
      const { data } = await axios.get(
        `${this.HR_SERVICE}/employees/accounts/pending`,
        { headers: this.headers(req) },
      );
      return data;
    } catch (error) {
      this.handleError(error as AxiosError, 'Error fetching pending employees');
    }
  }
}
