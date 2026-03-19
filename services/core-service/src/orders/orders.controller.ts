import { Controller, Get, Post, Param, Body, Delete, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDocument } from './schemas/order.schema';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get()
  async findAll() {
    return this.ordersService.findAll();
  }
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderDocument> {
    return this.ordersService.updateOrder(id, dto);
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
@Get('total')
async getTotalOrderAmount(): Promise<{ totalOrderAmount: number }> {
  return this.ordersService.getTotalOrderAmount();
}
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.ordersService.removeOrder(id);
  }
}