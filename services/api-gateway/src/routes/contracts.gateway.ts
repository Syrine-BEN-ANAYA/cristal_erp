import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  HttpException,
  HttpStatus,
  Logger,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import type { Request } from 'express';

@Controller('contracts')
export class ContractsGateway {
  private readonly logger = new Logger(ContractsGateway.name);
  private readonly HR_SERVICE_URL: string;
  private readonly DEFAULT_TIMEOUT = 10000;

  constructor() {
    this.HR_SERVICE_URL =
      process.env.HR_SERVICE_URL || 'http://localhost:3106';

    this.logger.log(`Contracts Gateway connected to: ${this.HR_SERVICE_URL}`);
  }

  // ======================================================
  // HELPERS
  // ======================================================

  private getHeaders(req: Request) {
    return {
      Authorization: req.headers.authorization || '',
      'Content-Type': 'application/json',
      'X-Gateway-Version': '1.0.0',
    };
  }

  private handleAxiosError(
    error: AxiosError,
    message: string,
    context?: string,
  ): never {
    const status =
      error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

    const data: any = error.response?.data;

    this.logger.error(
      `${message} - Status: ${status} - ${error.message}`,
      context || error.stack,
    );

    throw new HttpException(
      {
        statusCode: status,
        message: data?.message || data?.error || message,
        timestamp: new Date().toISOString(),
        path: context,
      },
      status,
    );
  }

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  // ======================================================
  // CREATE
  // ======================================================

  @Post()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )
  async create(@Body() dto: any, @Req() req: Request) {
    try {
      this.logger.log('Creating contract');

      const response = await axios.post(
        `${this.HR_SERVICE_URL}/contracts`,
        dto,
        {
          headers: this.getHeaders(req),
          timeout: this.DEFAULT_TIMEOUT,
        },
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Contract created successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Create contract failed',
        'POST /contracts',
      );
    }
  }

  // ======================================================
  // GET ALL
  // ======================================================

  @Get()
  async findAll(@Req() req: Request) {
    try {
      this.logger.log('Fetching all contracts');

      const response = await axios.get(`${this.HR_SERVICE_URL}/contracts`, {
        headers: this.getHeaders(req),
        timeout: this.DEFAULT_TIMEOUT,
      });

      const data = response.data?.data || response.data;

      return {
        statusCode: HttpStatus.OK,
        message: 'Contracts retrieved successfully',
        data: Array.isArray(data) ? data : [data],
        count: Array.isArray(data) ? data.length : data ? 1 : 0,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Get contracts failed',
        'GET /contracts',
      );
    }
  }

  // ======================================================
  // GET ACTIVE CONTRACTS
  // ======================================================

  @Get('active')
  async findActive(@Req() req: Request) {
    try {
      this.logger.log('Fetching active contracts');

      const response = await axios.get(`${this.HR_SERVICE_URL}/contracts/active`, {
        headers: this.getHeaders(req),
        timeout: this.DEFAULT_TIMEOUT,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Active contracts retrieved successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Get active contracts failed',
        'GET /contracts/active',
      );
    }
  }

  // ======================================================
  // GET EXPIRED CONTRACTS
  // ======================================================

  @Get('expired')
  async findExpired(@Req() req: Request) {
    try {
      this.logger.log('Fetching expired contracts');

      const response = await axios.get(`${this.HR_SERVICE_URL}/contracts/expired`, {
        headers: this.getHeaders(req),
        timeout: this.DEFAULT_TIMEOUT,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Expired contracts retrieved successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Get expired contracts failed',
        'GET /contracts/expired',
      );
    }
  }

  // ======================================================
  // GET BY EMPLOYEE
  // ======================================================

  @Get('employee/:employeeId')
  async findByEmployee(@Param('employeeId') employeeId: string, @Req() req: Request) {
    if (!this.isValidObjectId(employeeId)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid employee ID format',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      this.logger.log(`Fetching contracts for employee: ${employeeId}`);

      const response = await axios.get(
        `${this.HR_SERVICE_URL}/contracts/employee/${employeeId}`,
        {
          headers: this.getHeaders(req),
          timeout: this.DEFAULT_TIMEOUT,
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Employee contracts retrieved successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Get contracts by employee failed',
        `GET /contracts/employee/${employeeId}`,
      );
    }
  }

  // ======================================================
  // GET BY STATUS
  // ======================================================

  @Get('status/:status')
  async findByStatus(@Param('status') status: string, @Req() req: Request) {
    try {
      this.logger.log(`Fetching contracts by status: ${status}`);

      const response = await axios.get(
        `${this.HR_SERVICE_URL}/contracts/status/${status}`,
        {
          headers: this.getHeaders(req),
          timeout: this.DEFAULT_TIMEOUT,
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: `Contracts with status ${status} retrieved successfully`,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Get contracts by status failed',
        `GET /contracts/status/${status}`,
      );
    }
  }

  // ======================================================
  // GET BY TYPE
  // ======================================================

  @Get('type/:type')
  async findByType(@Param('type') type: string, @Req() req: Request) {
    try {
      this.logger.log(`Fetching contracts by type: ${type}`);

      const response = await axios.get(
        `${this.HR_SERVICE_URL}/contracts/type/${encodeURIComponent(type)}`,
        {
          headers: this.getHeaders(req),
          timeout: this.DEFAULT_TIMEOUT,
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: `Contracts of type ${type} retrieved successfully`,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Get contracts by type failed',
        `GET /contracts/type/${type}`,
      );
    }
  }

  // ======================================================
  // UPDATE - PUT (FULL UPDATE)
  // ======================================================

  @Put(':id')
  async putUpdate(@Param('id') id: string, @Body() dto: any, @Req() req: Request) {
    if (!this.isValidObjectId(id)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid contract ID format',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      this.logger.log(`PUT - Updating contract: ${id}`);

      const response = await axios.put(`${this.HR_SERVICE_URL}/contracts/${id}`, dto, {
        headers: this.getHeaders(req),
        timeout: this.DEFAULT_TIMEOUT,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Contract updated successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'PUT update contract failed',
        `PUT /contracts/${id}`,
      );
    }
  }

  // ======================================================
  // UPDATE - PATCH (PARTIAL UPDATE)
  // ======================================================

  @Patch(':id')
  async patchUpdate(@Param('id') id: string, @Body() dto: any, @Req() req: Request) {
    if (!this.isValidObjectId(id)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid contract ID format',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      this.logger.log(`PATCH - Updating contract: ${id}`);

      const response = await axios.patch(`${this.HR_SERVICE_URL}/contracts/${id}`, dto, {
        headers: this.getHeaders(req),
        timeout: this.DEFAULT_TIMEOUT,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Contract updated successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'PATCH update contract failed',
        `PATCH /contracts/${id}`,
      );
    }
  }

  // ======================================================
  // TERMINATE CONTRACT
  // ======================================================

  @Patch(':id/terminate')
  async terminateContract(
    @Param('id') id: string,
    @Req() req: Request,
    @Body('terminationDate') terminationDate?: string,
  ) {
    if (!this.isValidObjectId(id)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid contract ID format',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      this.logger.log(`Terminating contract: ${id}`);

      const response = await axios.patch(
        `${this.HR_SERVICE_URL}/contracts/${id}/terminate`,
        terminationDate ? { terminationDate } : {},
        {
          headers: this.getHeaders(req),
          timeout: this.DEFAULT_TIMEOUT,
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Contract terminated successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Terminate contract failed',
        `PATCH /contracts/${id}/terminate`,
      );
    }
  }

  // ======================================================
  // RENEW CONTRACT
  // ======================================================

  @Patch(':id/renew')
  async renewContract(
    @Param('id') id: string,
    @Req() req: Request,
    @Body('newEndDate') newEndDate: string,
  ) {
    if (!this.isValidObjectId(id)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid contract ID format',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!newEndDate) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'newEndDate is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      this.logger.log(`Renewing contract: ${id} until ${newEndDate}`);

      const response = await axios.patch(
        `${this.HR_SERVICE_URL}/contracts/${id}/renew`,
        { newEndDate },
        {
          headers: this.getHeaders(req),
          timeout: this.DEFAULT_TIMEOUT,
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Contract renewed successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Renew contract failed',
        `PATCH /contracts/${id}/renew`,
      );
    }
  }

  // ======================================================
  // DELETE
  // ======================================================

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    if (!this.isValidObjectId(id)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid contract ID format',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      this.logger.log(`Deleting contract: ${id}`);

      const response = await axios.delete(`${this.HR_SERVICE_URL}/contracts/${id}`, {
        headers: this.getHeaders(req),
        timeout: this.DEFAULT_TIMEOUT,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Contract deleted successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Delete contract failed',
        `DELETE /contracts/${id}`,
      );
    }
  }

  // ======================================================
  // DELETE BY EMPLOYEE
  // ======================================================

  @Delete('employee/:employeeId')
  async removeByEmployee(@Param('employeeId') employeeId: string, @Req() req: Request) {
    if (!this.isValidObjectId(employeeId)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid employee ID format',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      this.logger.log(`Deleting all contracts for employee: ${employeeId}`);

      const response = await axios.delete(
        `${this.HR_SERVICE_URL}/contracts/employee/${employeeId}`,
        {
          headers: this.getHeaders(req),
          timeout: this.DEFAULT_TIMEOUT,
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'All contracts for employee deleted successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Bulk delete contracts failed',
        `DELETE /contracts/employee/${employeeId}`,
      );
    }
  }

  // ======================================================
  // STATISTICS
  // ======================================================

  @Get('statistics')
  async getStatistics(@Req() req: Request) {
    try {
      this.logger.log('Fetching contract statistics');

      const response = await axios.get(`${this.HR_SERVICE_URL}/contracts/statistics`, {
        headers: this.getHeaders(req),
        timeout: this.DEFAULT_TIMEOUT,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Statistics retrieved successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Get statistics failed',
        'GET /contracts/statistics',
      );
    }
  }

  // ======================================================
  // GET ONE - MUST BE LAST
  // ======================================================

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    if (!this.isValidObjectId(id)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid contract ID format',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      this.logger.log(`Fetching contract: ${id}`);

      const response = await axios.get(`${this.HR_SERVICE_URL}/contracts/${id}`, {
        headers: this.getHeaders(req),
        timeout: this.DEFAULT_TIMEOUT,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Contract retrieved successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Get contract failed',
        `GET /contracts/${id}`,
      );
    }
  }

  // ======================================================
  // HEALTH CHECK
  // ======================================================

  @Get('health')
  async healthCheck() {
    try {
      const response = await axios.get(`${this.HR_SERVICE_URL}/health`, {
        timeout: 5000,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Contracts service healthy',
        data: response.data,
      };
    } catch {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Contracts service unavailable',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
