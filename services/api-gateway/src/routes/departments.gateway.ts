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

// ---------------- DTO ----------------

interface CreateDepartmentDto {
  name: string;
  description?: string;
}

interface UpdateDepartmentDto {
  name?: string;
  description?: string;
}

// ---------------- MODEL ----------------

interface Department {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Controller('departments')
export class DepartmentsGateway {
  private readonly HR_SERVICE_URL =
    process.env.HR_SERVICE_URL || 'http://localhost:3106';

  private readonly AUTH_SERVICE_URL =
    process.env.AUTH_SERVICE_URL || 'http://localhost:3101';

  constructor() {
    Logger.log('DepartmentsGateway initialized', 'API-GATEWAY');
  }

  // ---------------- HEADERS ----------------
  private getHeaders(req: Request) {
    return {
      Authorization: req.headers.authorization || '',
    };
  }

  // ---------------- ERROR HANDLER ----------------
  private handleAxiosError(err: AxiosError, defaultMsg: string): never {
    const errResponse = err.response?.data;

    let message = defaultMsg;

    if (errResponse) {
      if (typeof errResponse === 'string') message = errResponse;
      else if ((errResponse as any).message)
        message = (errResponse as any).message;
      else message = JSON.stringify(errResponse);
    } else if (err.message) {
      message = err.message;
    }

    throw new HttpException(
      message,
      err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  // =========================
  // CREATE
  // =========================

  @Post()
  async create(@Body() dto: CreateDepartmentDto, @Req() req: Request) {
    try {
      const response = await axios.post<Department>(
        `${this.HR_SERVICE_URL}/departments`,
        dto,
        { headers: this.getHeaders(req) },
      );

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la création du département',
      );
    }
  }

  // =========================
  // GET ALL
  // =========================

  @Get()
  async findAll(@Req() req: Request): Promise<Department[]> {
    try {
      const response = await axios.get<Department[]>(
        `${this.HR_SERVICE_URL}/departments`,
        { headers: this.getHeaders(req) },
      );

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la récupération des départements',
      );
    }
  }

  // =========================
  // GET ONE
  // =========================

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    try {
      const response = await axios.get<Department>(
        `${this.HR_SERVICE_URL}/departments/${id}`,
        { headers: this.getHeaders(req) },
      );

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la récupération du département',
      );
    }
  }

  // =========================
  // UPDATE
  // =========================

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
    @Req() req: Request,
  ) {
    try {
      const response = await axios.put<Department>(
        `${this.HR_SERVICE_URL}/departments/${id}`,
        dto,
        { headers: this.getHeaders(req) },
      );

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la mise à jour du département',
      );
    }
  }

  // =========================
  // DELETE
  // =========================

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    try {
      const response = await axios.delete<{ message: string }>(
        `${this.HR_SERVICE_URL}/departments/${id}`,
        { headers: this.getHeaders(req) },
      );

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la suppression du département',
      );
    }
  }
}
