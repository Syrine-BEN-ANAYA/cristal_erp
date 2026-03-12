import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './products.service';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto, @Req() req) {
    return this.productService.create(createProductDto, req.user);
  }
@Get('low-stock')

getLowStock() {
  return this.productService.getLowStockProducts();
}
  @Get()
  async findAll(@Req() req) {
    return this.productService.findAll(req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return this.productService.findOne(id, req.user);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req,
  ) {
    return this.productService.update(id, updateProductDto, req.user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    return this.productService.remove(id, req.user);
  }
}