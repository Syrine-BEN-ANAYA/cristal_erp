import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // 🟢 CREATE employee
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateEmployeeDto) {
    const data = await this.employeesService.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Employee created successfully',
      data,
    };
  }

  // 🔵 GET all employees
  @Get()
  async findAll() {
    const data = await this.employeesService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Employees retrieved successfully',
      data,
    };
  }

  // 🔵 GET one employee by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.employeesService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Employee retrieved successfully',
      data,
    };
  }

  // 🟡 UPDATE employee
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    const data = await this.employeesService.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Employee updated successfully',
      data,
    };
  }

  // 🔴 DELETE employee
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const data = await this.employeesService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Employee deleted successfully',
      data,
    };
  }
}
