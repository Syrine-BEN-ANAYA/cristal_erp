import { Controller, Get, Post, Patch, Delete, Param, Body, Put, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDocument } from './schemas/product.schema';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtLocalGuard } from '../common/guards/jwt-local.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('products')
@UseGuards(JwtLocalGuard, RolesGuard) 

export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
    @Roles('SUPER_ADMIN', 'USER')
  
  async create(@Body() dto: CreateProductDto): Promise<ProductDocument> {
    return this.productService.create(dto);
  }

  @Get()
    @Roles('SUPER_ADMIN', 'USER')

  async findAll(): Promise<ProductDocument[]> {
    return this.productService.findAll();
  }

  @Get('low-stock/list')
    @Roles('SUPER_ADMIN', 'USER')

  async findLowStock(): Promise<ProductDocument[]> {
    return this.productService.findLowStock();
  }

  @Get(':id')
    @Roles('SUPER_ADMIN', 'USER')

  async findOne(@Param('id') id: string): Promise<ProductDocument> {
    return this.productService.findOne(id);
  }

  @Put(':id')
    @Roles('SUPER_ADMIN', 'USER')

  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductDocument> {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
    @Roles('SUPER_ADMIN', 'USER')

  async remove(@Param('id') id: string): Promise<void> {
    return this.productService.remove(id);
  }

  @Put(':id/add-stock')
    @Roles('SUPER_ADMIN', 'USER')

  async addStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ): Promise<ProductDocument> {
    return this.productService.addStock(id, quantity);
  }

  @Put(':id/remove-stock')
    @Roles('SUPER_ADMIN', 'USER')

  async removeStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ): Promise<ProductDocument> {
    return this.productService.removeStock(id, quantity);
  }
}