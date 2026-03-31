import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtLocalGuard } from 'src/common/guards/jwt-local.guard';

@Controller('suppliers')
@UseGuards(JwtLocalGuard, RolesGuard) 
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
    @Roles('SUPER_ADMIN', 'USER')

  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Get()
    @Roles('SUPER_ADMIN', 'USER')

  findAll() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
    @Roles('SUPER_ADMIN', 'USER')

  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Put(':id')
    @Roles('SUPER_ADMIN', 'USER')

  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }

  @Delete(':id')
    @Roles('SUPER_ADMIN', 'USER')

  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}