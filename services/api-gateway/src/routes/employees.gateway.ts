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

interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;

  phoneNumber?: string;

  gender?: 'male' | 'female';

  departmentId?: string;

  position: string;

  status?: string;

  hireDate?: Date;

  skills?: string[];

  isActive?: boolean;
}

interface UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  email?: string;

  phoneNumber?: string;

  gender?: 'male' | 'female';

  departmentId?: string;

  position?: string;

  status?: string;

  hireDate?: Date;

  skills?: string[];

  isActive?: boolean;
}

// ---------------- MODEL ----------------

interface Employee {
  _id: string;

  firstName: string;

  lastName: string;

  email: string;

  phoneNumber?: string;

  gender?: string;

  departmentId?: string;

  position?: string;

  status?: string;

  hireDate?: string;

  skills?: string[];

  isActive?: boolean;

  createdAt?: string;

  updatedAt?: string;
}

@Controller('employees')
export class EmployeesGateway {
  private readonly HR_SERVICE_URL =
    process.env.HR_SERVICE_URL || 'http://localhost:3106';

  private readonly AUTH_SERVICE_URL =
    process.env.AUTH_SERVICE_URL || 'http://localhost:3101';

  constructor() {
    Logger.log('EmployeesGateway chargé correctement', 'API-GATEWAY');
  }

  // ---------------- ERROR HANDLER ----------------

  private handleAxiosError(err: AxiosError, defaultMsg: string): never {
    const errResponse = err.response?.data;

    let message = defaultMsg;

    if (errResponse) {
      if (typeof errResponse === 'string') {
        message = errResponse;
      } else if ((errResponse as any).message) {
        message = (errResponse as any).message;
      } else {
        message = JSON.stringify(errResponse);
      }
    } else if (err.message) {
      message = err.message;
    }

    throw new HttpException(
      message,
      err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  // ---------------- HEADERS ----------------

  private getHeaders(req: Request) {
    return {
      Authorization: req.headers.authorization || '',
    };
  }

  // ---------------- AUDIT LOG ----------------

  private async sendAuditLog(data: {
    userId: string;
    username: string;
    action: string;
    entity: string;
    ip?: string;
    endpoint?: string;
    details?: any;
  }) {
    try {
      await axios.post(
        `${this.AUTH_SERVICE_URL}/audits/remote-log`,
        data,
        {
          headers: {
            'x-internal-token':
              process.env.INTERNAL_API_KEY || 'internal-secret',
          },
        },
      );
    } catch (error) {
      Logger.error('Failed to send audit log', 'EmployeesGateway');
    }
  }

  // ---------------- CREATE ----------------

  @Post()
  async create(
    @Body() dto: CreateEmployeeDto,
    @Req() req: Request,
  ): Promise<Employee> {
    try {
      const response = await axios.post<Employee>(
        `${this.HR_SERVICE_URL}/employees`,
        dto,
        {
          headers: this.getHeaders(req),
        },
      );

      const user = (req as any).user;

      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'CREATE_EMPLOYEE',
          entity: 'EMPLOYEE',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || '/employees',

          details: {
            employeeId: response.data._id,
            email: response.data.email,
            fullName: `${response.data.firstName} ${response.data.lastName}`,
          },
        });
      }

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la création de l’employé',
      );
    }
  }

  // ---------------- FIND ALL ----------------

  @Get()
  async findAll(@Req() req: Request): Promise<Employee[]> {
    try {
      const response = await axios.get<Employee[]>(
        `${this.HR_SERVICE_URL}/employees`,
        {
          headers: this.getHeaders(req),
        },
      );

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la récupération des employés',
      );
    }
  }

  // ---------------- FIND ONE ----------------

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Employee> {
    try {
      const response = await axios.get<Employee>(
        `${this.HR_SERVICE_URL}/employees/${id}`,
        {
          headers: this.getHeaders(req),
        },
      );

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la récupération de l’employé',
      );
    }
  }

  // ---------------- UPDATE ----------------

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @Req() req: Request,
  ): Promise<Employee> {
    try {
      const response = await axios.put<Employee>(
        `${this.HR_SERVICE_URL}/employees/${id}`,
        dto,
        {
          headers: this.getHeaders(req),
        },
      );

      const user = (req as any).user;

      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'UPDATE_EMPLOYEE',
          entity: 'EMPLOYEE',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || `/employees/${id}`,

          details: {
            employeeId: id,
            updatedFields: dto,
          },
        });
      }

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la mise à jour de l’employé',
      );
    }
  }

  // ---------------- DELETE ----------------

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    try {
      const response = await axios.delete<{ message: string }>(
        `${this.HR_SERVICE_URL}/employees/${id}`,
        {
          headers: this.getHeaders(req),
        },
      );

      const user = (req as any).user;

      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'DELETE_EMPLOYEE',
          entity: 'EMPLOYEE',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || `/employees/${id}`,

          details: {
            employeeId: id,
          },
        });
      }

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la suppression de l’employé',
      );
    }
  }
}
