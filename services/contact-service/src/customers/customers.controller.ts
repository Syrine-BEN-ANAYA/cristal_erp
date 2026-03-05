import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtLocalGuard } from 'src/common/guards/jwt-local.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @UseGuards(JwtLocalGuard, RolesGuard)
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Get()
  @UseGuards(JwtLocalGuard, RolesGuard)
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtLocalGuard, RolesGuard)
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtLocalGuard, RolesGuard)
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtLocalGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}