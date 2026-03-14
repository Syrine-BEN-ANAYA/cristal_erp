import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { ProductService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // -------------------- CRUD --------------------
  @Post()
  async create(@Body() dto: CreateProductDto, @Query('user') requester: any) {
    return this.productService.create(dto, requester);
  }

  @Get()
  async findAll(@Query('user') requester: any) {
    return this.productService.findAll(requester);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('user') requester: any) {
    return this.productService.findOne(id, requester);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto, @Query('user') requester: any) {
    return this.productService.update(id, dto, requester);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Query('user') requester: any) {
    return this.productService.remove(id, requester);
  }

  // -------------------- Stock management --------------------
  @Patch(':id/add-stock')
  async addStock(@Param('id') id: string, @Body('quantity') quantity: number) {
    await this.productService.addStock(id, quantity);
    return { message: 'Stock added successfully' };
  }

  @Patch(':id/remove-stock')
  async removeStock(@Param('id') id: string, @Body('quantity') quantity: number) {
    await this.productService.removeStock(id, quantity);
    return { message: 'Stock removed successfully' };
  }

  @Get('low-stock/list')
  async getLowStockProducts() {
    return this.productService.getLowStockProducts();
  }
}