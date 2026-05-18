import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductsService } from '../products/products.service';
import { Order, OrderDocument, OrderItem } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productService: ProductsService,
  ) {}

  // ---------------- CREATE ORDER ----------------
  async createOrder(dto: CreateOrderDto): Promise<OrderDocument> {
    const { customerId, items } = dto;

    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('ID client invalide');
    }

    if (!items || items.length === 0) {
      throw new BadRequestException('Aucun produit dans la commande');
    }

    let totalAmount = 0;

    // Vérifie chaque produit et met à jour le stock
    for (const item of items) {
      const product = await this.productService.findOne(item.productId);

      if (!product) {
        throw new NotFoundException(`Produit ${item.productId} non trouvé`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour ${product.name}`,
        );
      }

      await this.productService.removeStock(
        item.productId,
        item.quantity,
      );

      totalAmount += product.price * item.quantity;
    }

    const orderItems: OrderItem[] = items.map((i) => ({
      productId: new Types.ObjectId(i.productId),
      quantity: i.quantity,
    }));

    const order = new this.orderModel({
      customerId: new Types.ObjectId(customerId),
      items: orderItems,
      totalAmount,
    });

    return await order.save();
  }

  // ---------------- FIND ALL DETAILED ----------------
  async findAllDetailed() {
    return this.orderModel
      .find()
      .populate('items.productId')
      .populate('customerId')
      .lean();
  }

  // ---------------- FIND ALL ORDERS ----------------
  async findAll(): Promise<OrderDocument[]> {
    return this.orderModel
      .find()
      .populate('items.productId')
      .populate('customerId')
      .exec();
  }

  // ---------------- FIND ONE ORDER ----------------
  async findOne(orderId: string): Promise<OrderDocument> {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('ID commande invalide');
    }

    const order = await this.orderModel
      .findById(orderId)
      .populate('customerId')
      .populate('items.productId')
      .exec();

    if (!order) {
      throw new NotFoundException('Commande non trouvée');
    }

    return order;
  }

  // ---------------- UPDATE ORDER ----------------
  async updateOrder(
    orderId: string,
    dto: CreateOrderDto,
  ): Promise<OrderDocument> {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('ID commande invalide');
    }

    if (!Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException(
        'Le champ items doit être un tableau non vide',
      );
    }

    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Commande non trouvée');
    }

    const oldItems = [...order.items];

    // Remettre le stock des anciens items
    for (const oldItem of oldItems) {
      await this.productService.addStock(
        oldItem.productId.toString(),
        oldItem.quantity,
      );
    }

    let totalAmount = 0;
    const updatedItems: OrderItem[] = [];

    for (const item of dto.items) {
      const product = await this.productService.findOne(item.productId);

      if (!product) {
        throw new NotFoundException(
          `Produit ${item.productId} non trouvé`,
        );
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour ${product.name}`,
        );
      }

      await this.productService.removeStock(
        item.productId,
        item.quantity,
      );

      totalAmount += product.price * item.quantity;

      updatedItems.push({
        productId: new Types.ObjectId(item.productId),
        quantity: item.quantity,
      });
    }

    order.items = updatedItems;
    order.customerId = new Types.ObjectId(dto.customerId);
    order.totalAmount = totalAmount;

    return await order.save();
  }

  // ---------------- DELETE ORDER ----------------
  async removeOrder(orderId: string): Promise<void> {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new BadRequestException('ID commande invalide');
    }

    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Commande non trouvée');
    }

    // Remettre le stock
    for (const item of order.items) {
      await this.productService.addStock(
        item.productId.toString(),
        item.quantity,
      );
    }

    await this.orderModel.findByIdAndDelete(orderId).exec();
  }

  // ---------------- TOTAL REVENUE ----------------
  async getTotalOrderAmount(): Promise<{ totalOrderAmount: number }> {
    const orders = await this.orderModel.find().exec();

    const totalOrderAmount = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    return { totalOrderAmount };
  }
}