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
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  // ================= CREATE =================
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createPayrollDto: CreatePayrollDto) {
    const data = await this.payrollService.create(createPayrollDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Payroll created successfully',
      data,
    };
  }

  // ================= GET ALL =================
  @Get()
  async findAll() {
    const data = await this.payrollService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Payrolls retrieved successfully',
      data,
      count: data.length,
    };
  }

  // ================= GET BY PERIOD =================
  @Get('period')
  async findByPeriod(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const data = await this.payrollService.findByPeriod(
      parseInt(month, 10),
      parseInt(year, 10),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Payrolls retrieved successfully',
      data,
      count: data.length,
    };
  }

  // ================= GET BY STATUS =================
  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    const data = await this.payrollService.findByStatus(status);
    return {
      statusCode: HttpStatus.OK,
      message: `Payrolls with status ${status} retrieved successfully`,
      data,
      count: data.length,
    };
  }

  // ================= GET BY EMPLOYEE =================
  @Get('employee/:employeeId')
  async findByEmployee(@Param('employeeId') employeeId: string) {
    const data = await this.payrollService.findByEmployee(employeeId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payrolls retrieved successfully',
      data,
      count: data.length,
    };
  }

  // ================= STATISTICS =================
  @Get('statistics')
  async getStatistics() {
    const data = await this.payrollService.getStatistics();
    return {
      statusCode: HttpStatus.OK,
      message: 'Statistics retrieved successfully',
      data,
    };
  }

  // ================= BULK PROCESS =================
  @Post('bulk/process')
  @HttpCode(HttpStatus.OK)
  async processBulk(
    @Body() body: { month: number; year: number; employeeIds: string[] },
  ) {
    const data = await this.payrollService.processBulkPayroll(
      body.month,
      body.year,
      body.employeeIds,
    );
    return {
      statusCode: HttpStatus.OK,
      message: `Bulk payroll processed: ${data.created} created`,
      data,
    };
  }

  // ================= GET ONE =================
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.payrollService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payroll retrieved successfully',
      data,
    };
  }

  // ================= UPDATE =================
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePayrollDto: UpdatePayrollDto,
  ) {
    const data = await this.payrollService.update(id, updatePayrollDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payroll updated successfully',
      data,
    };
  }

  // ================= UPDATE - PUT (FULL) =================
  @Put(':id')
  async fullUpdate(
    @Param('id') id: string,
    @Body() updatePayrollDto: UpdatePayrollDto,
  ) {
    const data = await this.payrollService.update(id, updatePayrollDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payroll updated successfully',
      data,
    };
  }

  // ================= DELETE =================
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const data = await this.payrollService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payroll deleted successfully',
      data,
    };
  }

  // ================= DELETE BY EMPLOYEE =================
  @Delete('employee/:employeeId')
  @HttpCode(HttpStatus.OK)
  async removeByEmployee(@Param('employeeId') employeeId: string) {
    const data = await this.payrollService.removeByEmployee(employeeId);
    return {
      statusCode: HttpStatus.OK,
      message: `Deleted ${data.deletedCount} payroll records`,
      data,
    };
  }
}
