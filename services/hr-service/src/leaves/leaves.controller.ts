import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';

@Controller('leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createLeaveDto: CreateLeaveDto) {
    const data = await this.leavesService.create(createLeaveDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Leave created successfully',
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.leavesService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Leaves retrieved successfully',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.leavesService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Leave retrieved successfully',
      data,
    };
  }

  @Get('employee/:employeeId')
  async findByEmployee(@Param('employeeId') employeeId: string) {
    if (!employeeId || employeeId.trim() === '') {
      return {
        statusCode: HttpStatus.OK,
        message: 'No employee ID provided',
        data: [],
      };
    }
    const data = await this.leavesService.findByEmployee(employeeId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Leaves retrieved successfully',
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLeaveDto: UpdateLeaveDto,
  ) {
    const data = await this.leavesService.update(id, updateLeaveDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Leave updated successfully',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const data = await this.leavesService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Leave deleted successfully',
      data,
    };
  }
}
