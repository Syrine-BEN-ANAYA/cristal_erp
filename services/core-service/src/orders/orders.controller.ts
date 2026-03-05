import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtLocalGuard } from '../common/guards/jwt-local.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtLocalGuard)
  async create(@Body() dto: CreateOrderDto, @Req() req) {
    const token = req.headers.authorization;
    return this.ordersService.create(dto, token);
  }

  @Get()
  @UseGuards(JwtLocalGuard)
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtLocalGuard)
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtLocalGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateOrderDto, @Req() req) {
    const token = req.headers.authorization;
    return this.ordersService.update(id, dto, token);
  }

  @Delete(':id')
  @UseGuards(JwtLocalGuard)
  async remove(@Param('id') id: string, @Req() req) {
    const token = req.headers.authorization;
    return this.ordersService.remove(id, token);
  }

  @Delete()
  @UseGuards(JwtLocalGuard)
  async deleteByMonth(@Query('month') month: string, @Req() req) {
    const token = req.headers.authorization;
    return this.ordersService.deleteByMonth(month, token);
  }
}