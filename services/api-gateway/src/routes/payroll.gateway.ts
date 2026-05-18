import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpException,
  HttpStatus,
  Logger,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import type { Request } from 'express';

@Controller('payroll')
export class PayrollGateway {
  private readonly logger = new Logger(PayrollGateway.name);
  private readonly HR_SERVICE_URL: string;
  private readonly DEFAULT_TIMEOUT = 10000;

  constructor() {
    this.HR_SERVICE_URL = process.env.HR_SERVICE_URL || 'http://localhost:3106';

    this.logger.log(`Payroll Gateway connected to: ${this.HR_SERVICE_URL}`);
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
    const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

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
  // CREATE PAYROLL
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
      this.logger.log('Creating payroll');

      const response = await axios.post(`${this.HR_SERVICE_URL}/payroll`, dto, {
        headers: this.getHeaders(req),
        timeout: this.DEFAULT_TIMEOUT,
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Payroll created successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Create payroll failed',
        'POST /payroll',
      );
    }
  }

  // ======================================================
  // GET ALL PAYROLLS
  // ======================================================

  @Get()
  async findAll(@Req() req: Request) {
    try {
      this.logger.log('Fetching all payrolls');

      const response = await axios.get(`${this.HR_SERVICE_URL}/payroll`, {
        headers: this.getHeaders(req),
        timeout: this.DEFAULT_TIMEOUT,
      });

      const data = response.data?.data || response.data;

      return {
        statusCode: HttpStatus.OK,
        message: 'Payrolls retrieved successfully',
        data: Array.isArray(data) ? data : [data],
        count: Array.isArray(data) ? data.length : data ? 1 : 0,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Get payrolls failed',
        'GET /payroll',
      );
    }
  }

  // ======================================================
  // GET STATISTICS
  // ======================================================

  @Get('statistics')
  async getStatistics(@Req() req: Request) {
    try {
      this.logger.log('Fetching payroll statistics');

      const response = await axios.get(
        `${this.HR_SERVICE_URL}/payroll/statistics`,
        {
          headers: this.getHeaders(req),
          timeout: this.DEFAULT_TIMEOUT,
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Statistics retrieved successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Get statistics failed',
        'GET /payroll/statistics',
      );
    }
  }

  // ======================================================
  // GET BY PERIOD
  // ======================================================

  @Get('period')
  async findByPeriod(
    @Query('month') month: string,
    @Query('year') year: string,
    @Req() req: Request,
  ) {
    if (!month || !year) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Month and year are required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      this.logger.log(`Fetching payrolls for period: ${month}/${year}`);

      const response = await axios.get(
        `${this.HR_SERVICE_URL}/payroll/period?month=${month}&year=${year}`,
        {
          headers: this.getHeaders(req),
          timeout: this.DEFAULT_TIMEOUT,
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Payrolls retrieved successfully',
        data: response.data?.data || response.data,
        count: response.data?.count || 0,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Get payrolls by period failed',
        `GET /payroll/period?month=${month}&year=${year}`,
      );
    }
  }

  // ======================================================
  // GET BY STATUS
  // ======================================================

  @Get('status/:status')
  async findByStatus(@Param('status') status: string, @Req() req: Request) {
    try {
      this.logger.log(`Fetching payrolls with status: ${status}`);

      const response = await axios.get(
        `${this.HR_SERVICE_URL}/payroll/status/${status}`,
        {
          headers: this.getHeaders(req),
          timeout: this.DEFAULT_TIMEOUT,
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: `Payrolls with status ${status} retrieved successfully`,
        data: response.data?.data || response.data,
        count: response.data?.count || 0,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Get payrolls by status failed',
        `GET /payroll/status/${status}`,
      );
    }
  }

  // ======================================================
  // GET BY EMPLOYEE
  // ======================================================

  @Get('employee/:employeeId')
  async findByEmployee(
    @Param('employeeId') employeeId: string,
    @Req() req: Request,
  ) {
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
      this.logger.log(`Fetching payrolls for employee: ${employeeId}`);

      const response = await axios.get(
        `${this.HR_SERVICE_URL}/payroll/employee/${employeeId}`,
        {
          headers: this.getHeaders(req),
          timeout: this.DEFAULT_TIMEOUT,
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Payrolls retrieved successfully',
        data: response.data?.data || response.data,
        count: response.data?.count || 0,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Get payrolls by employee failed',
        `GET /payroll/employee/${employeeId}`,
      );
    }
  }

  // ======================================================
  // BULK PROCESS PAYROLL
  // ======================================================

  @Post('bulk/process')
  @HttpCode(HttpStatus.OK)
  async processBulk(@Body() body: any, @Req() req: Request) {
    if (!body.month || !body.year) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Month and year are required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      this.logger.log(`Processing bulk payroll for ${body.month}/${body.year}`);

      const response = await axios.post(
        `${this.HR_SERVICE_URL}/payroll/bulk/process`,
        body,
        {
          headers: this.getHeaders(req),
          timeout: this.DEFAULT_TIMEOUT,
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Bulk payroll processed successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Bulk payroll processing failed',
        'POST /payroll/bulk/process',
      );
    }
  }

  // ======================================================
  // GET ONE
  // ======================================================

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    if (!this.isValidObjectId(id)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid payroll ID format',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      this.logger.log(`Fetching payroll: ${id}`);

      const response = await axios.get(`${this.HR_SERVICE_URL}/payroll/${id}`, {
        headers: this.getHeaders(req),
        timeout: this.DEFAULT_TIMEOUT,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Payroll retrieved successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Get payroll failed',
        `GET /payroll/${id}`,
      );
    }
  }

  // ======================================================
  // UPDATE - PATCH (PARTIAL)
  // ======================================================

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any, @Req() req: Request) {
    if (!this.isValidObjectId(id)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid payroll ID format',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      this.logger.log(`Updating payroll: ${id}`);

      const response = await axios.patch(
        `${this.HR_SERVICE_URL}/payroll/${id}`,
        dto,
        {
          headers: this.getHeaders(req),
          timeout: this.DEFAULT_TIMEOUT,
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Payroll updated successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Update payroll failed',
        `PATCH /payroll/${id}`,
      );
    }
  }

  // ======================================================
  // UPDATE - PUT (FULL)
  // ======================================================

  @Put(':id')
  async fullUpdate(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: Request,
  ) {
    if (!this.isValidObjectId(id)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid payroll ID format',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      this.logger.log(`Full updating payroll: ${id}`);

      const response = await axios.put(
        `${this.HR_SERVICE_URL}/payroll/${id}`,
        dto,
        {
          headers: this.getHeaders(req),
          timeout: this.DEFAULT_TIMEOUT,
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Payroll updated successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Full update payroll failed',
        `PUT /payroll/${id}`,
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
          message: 'Invalid payroll ID format',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      this.logger.log(`Deleting payroll: ${id}`);

      const response = await axios.delete(
        `${this.HR_SERVICE_URL}/payroll/${id}`,
        {
          headers: this.getHeaders(req),
          timeout: this.DEFAULT_TIMEOUT,
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Payroll deleted successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Delete payroll failed',
        `DELETE /payroll/${id}`,
      );
    }
  }

  // ======================================================
  // DELETE BY EMPLOYEE
  // ======================================================

  @Delete('employee/:employeeId')
  async removeByEmployee(
    @Param('employeeId') employeeId: string,
    @Req() req: Request,
  ) {
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
      this.logger.log(`Deleting all payrolls for employee: ${employeeId}`);

      const response = await axios.delete(
        `${this.HR_SERVICE_URL}/payroll/employee/${employeeId}`,
        {
          headers: this.getHeaders(req),
          timeout: this.DEFAULT_TIMEOUT,
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Payrolls deleted successfully',
        data: response.data?.data || response.data,
      };
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Delete payrolls by employee failed',
        `DELETE /payroll/employee/${employeeId}`,
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
        message: 'Payroll service healthy',
        data: response.data,
      };
    } catch {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Payroll service unavailable',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
