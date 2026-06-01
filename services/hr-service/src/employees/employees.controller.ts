import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // =====================================================
  // CREATE (HR)
  // =====================================================
  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  // =====================================================
  // GET ALL EMPLOYEES
  // =====================================================
  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  // =====================================================
  // GET ONE EMPLOYEE
  // =====================================================
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  // =====================================================
  // UPDATE BY HR (restricted rules)
  // =====================================================
  @Put('hr/:id')
  updateByHr(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeesService.updateByHr(id, dto);
  }

  // =====================================================
  // UPDATE GENERAL (ADMIN / SYSTEM)
  // =====================================================
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeesService.update(id, dto);
  }

  // =====================================================
  // GET EMPLOYEES WAITING FOR ACCOUNT CREATION
  // =====================================================
  @Get('accounts/pending')
  findPendingAccounts() {
    return this.employeesService.findPendingAccounts();
  }
}
