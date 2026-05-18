import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';

import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Controller('departments')
export class DepartmentsController {
  constructor(
    private readonly departmentsService: DepartmentsService,
  ) {}

  // CREATE
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateDepartmentDto) {
    const data = await this.departmentsService.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Department created successfully',
      data,
    };
  }

  // GET ALL
  @Get()
  async findAll() {
    const data = await this.departmentsService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Departments retrieved successfully',
      data,
    };
  }

  // GET ONE
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.departmentsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Department retrieved successfully',
      data,
    };
  }

  // UPDATE
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    const data = await this.departmentsService.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Department updated successfully',
      data,
    };
  }

  // DELETE
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const data = await this.departmentsService.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Department deleted successfully',
      data,
    };
  }
}
