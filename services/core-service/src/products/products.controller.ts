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
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
// @UseGuards(JwtAuthGuard, RolesGuard) // décommentez si vous avez l'authentification
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  // @Roles('ADMIN', 'MANAGER')
  async create(@Body() createProductDto: CreateProductDto, @Req() req) {
    return this.productService.create(createProductDto, req.user);
  }

  @Get()
  // @Roles('ADMIN', 'MANAGER', 'USER')
  async findAll(@Req() req) {
    return this.productService.findAll(req.user);
  }

  @Get(':id')
  // @Roles('ADMIN', 'MANAGER', 'USER')
  async findOne(@Param('id') id: string, @Req() req) {
    return this.productService.findOne(id, req.user);
  }

  @Put(':id')
  // @Roles('ADMIN', 'MANAGER')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req,
  ) {
    return this.productService.update(id, updateProductDto, req.user);
  }

  @Delete(':id')
  // @Roles('ADMIN')
  async remove(@Param('id') id: string, @Req() req) {
    return this.productService.remove(id, req.user);
  }
}