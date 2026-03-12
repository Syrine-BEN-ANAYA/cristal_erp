import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductService } from '../products/products.service';

@Injectable()
export class OrderService {

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productService: ProductService,
  ) {}

  async createOrder(dto: CreateOrderDto) {

    const order = await this.orderModel.create(dto);

    for (const item of dto.items) {

      await this.productService.removeStock(
        item.productId.toString(),
        item.quantity
      );

    }

    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find()
      .populate('customerId')
      .populate('items.productId')
      .exec();
  }

  async findOne(id: string): Promise<Order> {

    const order = await this.orderModel.findById(id)
      .populate('customerId')
      .populate('items.productId')
      .exec();

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return order;
  }

async remove(id: string): Promise<void> {
  const order = await this.orderModel.findById(id);
  if (!order) throw new NotFoundException(`Order not found`);

  // Restituer le stock
  for (const item of order.items) {
    await this.productService.addStock(item.productId.toString(), item.quantity);
  }

  // Supprimer l'order
  await this.orderModel.findByIdAndDelete(id);

  // Ne rien renvoyer → HTTP 204
}


}
