import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  Patch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import type { Request } from 'express';

// ---------------- DTO ----------------

interface CreateLeaveDto {
  employeeId: string;
  type: string;
  startDate: Date | string;
  endDate: Date | string;
  status?: string;
  reason?: string;
}

interface UpdateLeaveDto {
  type?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: string;
  reason?: string;
}

// ---------------- MODEL ----------------

interface Leave {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  type: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Controller('leaves')
export class LeavesGateway {
  private readonly HR_SERVICE_URL =
    process.env.HR_SERVICE_URL || 'http://localhost:3106';

  private readonly AUTH_SERVICE_URL =
    process.env.AUTH_SERVICE_URL || 'http://localhost:3101';

  constructor() {
    Logger.log('LeavesGateway initialized', 'API-GATEWAY');
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
      Logger.error('Failed to send audit log', 'LeavesGateway');
    }
  }

  // =========================
  // CREATE LEAVE
  // =========================
  @Post()
  async create(@Body() dto: CreateLeaveDto, @Req() req: Request): Promise<Leave> {
    try {
      const response = await axios.post<Leave>(
        `${this.HR_SERVICE_URL}/leaves`,
        dto,
        { headers: this.getHeaders(req) },
      );

      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'CREATE_LEAVE',
          entity: 'LEAVE',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || '/leaves',
          details: {
            leaveId: response.data._id,
            employeeId: dto.employeeId,
            type: dto.type,
            startDate: dto.startDate,
            endDate: dto.endDate,
          },
        });
      }

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la création du congé',
      );
    }
  }

  // =========================
  // GET ALL LEAVES
  // =========================
  @Get()
  async findAll(@Req() req: Request): Promise<Leave[]> {
    try {
      const response = await axios.get<Leave[]>(
        `${this.HR_SERVICE_URL}/leaves`,
        { headers: this.getHeaders(req) },
      );

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la récupération des congés',
      );
    }
  }

  // =========================
  // GET LEAVE BY ID
  // =========================
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request): Promise<Leave> {
    try {
      const response = await axios.get<Leave>(
        `${this.HR_SERVICE_URL}/leaves/${id}`,
        { headers: this.getHeaders(req) },
      );

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la récupération du congé',
      );
    }
  }

  // =========================
  // GET LEAVES BY EMPLOYEE
  // =========================
  @Get('employee/:employeeId')
  async findByEmployee(
    @Param('employeeId') employeeId: string,
    @Req() req: Request,
  ): Promise<Leave[]> {
    try {
      const response = await axios.get<Leave[]>(
        `${this.HR_SERVICE_URL}/leaves/employee/${employeeId}`,
        { headers: this.getHeaders(req) },
      );

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la récupération des congés de l’employé',
      );
    }
  }

  // =========================
  // UPDATE LEAVE
  // =========================
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLeaveDto,
    @Req() req: Request,
  ): Promise<Leave> {
    try {
      const response = await axios.put<Leave>(
        `${this.HR_SERVICE_URL}/leaves/${id}`,
        dto,
        { headers: this.getHeaders(req) },
      );

      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'UPDATE_LEAVE',
          entity: 'LEAVE',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || `/leaves/${id}`,
          details: {
            leaveId: id,
            updatedFields: dto,
          },
        });
      }

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la mise à jour du congé',
      );
    }
  }

  // =========================
  // UPDATE LEAVE STATUS
  // =========================
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Req() req: Request,
  ): Promise<Leave> {
    try {
      const response = await axios.patch<Leave>(
        `${this.HR_SERVICE_URL}/leaves/${id}/status`,
        { status },
        { headers: this.getHeaders(req) },
      );

      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'UPDATE_LEAVE_STATUS',
          entity: 'LEAVE',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || `/leaves/${id}/status`,
          details: {
            leaveId: id,
            newStatus: status,
          },
        });
      }

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la mise à jour du statut du congé',
      );
    }
  }

  // =========================
  // DELETE LEAVE
  // =========================
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    try {
      const response = await axios.delete<{ message: string }>(
        `${this.HR_SERVICE_URL}/leaves/${id}`,
        { headers: this.getHeaders(req) },
      );

      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'DELETE_LEAVE',
          entity: 'LEAVE',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || `/leaves/${id}`,
          details: {
            leaveId: id,
          },
        });
      }

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la suppression du congé',
      );
    }
  }

  // =========================
  // GET LEAVES STATISTICS
  // =========================
  @Get('statistics/summary')
  async getStatistics(@Req() req: Request): Promise<any> {
    try {
      const response = await axios.get(
        `${this.HR_SERVICE_URL}/leaves/statistics/summary`,
        { headers: this.getHeaders(req) },
      );

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la récupération des statistiques',
      );
    }
  }
}
