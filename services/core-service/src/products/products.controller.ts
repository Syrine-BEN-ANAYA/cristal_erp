import { Controller, Get, Post, Patch, Delete, Param, Body, Put } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDocument } from './schemas/product.schema';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  async create(@Body() dto: CreateProductDto): Promise<ProductDocument> {
    return this.productService.create(dto);
  }

  @Get()
  async findAll(): Promise<ProductDocument[]> {
    return this.productService.findAll();
  }

  @Get('low-stock/list')
  async findLowStock(): Promise<ProductDocument[]> {
    return this.productService.findLowStock();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductDocument> {
    return this.productService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductDocument> {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.productService.remove(id);
  }

  @Put(':id/add-stock')
  async addStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ): Promise<ProductDocument> {
    return this.productService.addStock(id, quantity);
  }

  @Put(':id/remove-stock')
  async removeStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ): Promise<ProductDocument> {
    return this.productService.removeStock(id, quantity);
  }
}