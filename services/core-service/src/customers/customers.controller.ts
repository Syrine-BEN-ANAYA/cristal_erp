import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtLocalGuard } from '../common/guards/jwt-local.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('customers')
@UseGuards(JwtLocalGuard, RolesGuard) 
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'USER')
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Get()
    @Roles('SUPER_ADMIN', 'USER')

  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
    @Roles('SUPER_ADMIN', 'USER')

  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Put(':id')
    @Roles('SUPER_ADMIN', 'USER')

  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Delete(':id')
    @Roles('SUPER_ADMIN', 'USER')

  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}