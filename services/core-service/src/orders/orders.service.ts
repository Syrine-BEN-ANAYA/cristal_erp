import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductsService } from '../products/products.service';
import { Order, OrderDocument, OrderItem } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuditClient } from '../audit/audit.client';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productService: ProductsService,
    private auditClient: AuditClient, // ✅ Injecter l'audit
  ) {}

  // ---------------- CREATE ORDER ----------------
  async createOrder(dto: CreateOrderDto, user?: any, req?: any): Promise<OrderDocument> {
    const { customerId, items } = dto;

    if (!Types.ObjectId.isValid(customerId)) throw new BadRequestException('ID client invalide');
    if (!items || items.length === 0) throw new BadRequestException('Aucun produit dans la commande');

    let totalAmount = 0;
    const productDetails = [];

    // Vérifie chaque produit et met à jour le stock
    for (const item of items) {
      const product = await this.productService.findOne(item.productId);
      if (!product) throw new NotFoundException(`Produit ${item.productId} non trouvé`);
      if (product.stock < item.quantity)
        throw new BadRequestException(`Stock insuffisant pour ${product.name}`);

      await this.productService.removeStock(item.productId, item.quantity);
      totalAmount += product.price * item.quantity;
      
      productDetails.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const orderItems: OrderItem[] = items.map(i => ({
      productId: new Types.ObjectId(i.productId),
      quantity: i.quantity,
    }));

    const order = new this.orderModel({
      customerId: new Types.ObjectId(customerId),
      items: orderItems,
      totalAmount,
    });

    const savedOrder = await order.save();

    // ✅ Audit: Création commande
    await this.auditClient.log({
      userId: user?._id?.toString() || 'system',
      username: user?.username || 'system',
      action: 'CREATE_ORDER',
      entity: 'ORDER',
      ip: req?.ip,
      endpoint: req?.originalUrl || '/orders',
      details: {
        orderId: savedOrder._id.toString(),
        customerId,
        totalAmount,
        items: productDetails,
      },
    });

    return savedOrder;
  }

  async findAllDetailed() {
    return this.orderModel
      .find()
      .populate('items.productId')
      .populate('customerId')
      .lean();
  }

  // ---------------- FIND ALL ORDERS ----------------
  async findAll(user?: any, req?: any): Promise<OrderDocument[]> {
    const orders = await this.orderModel
      .find()
      .populate('items.productId')
      .populate('customerId')
      .exec();

    // ✅ Audit: Consultation liste commandes
    if (user) {
      await this.auditClient.log({
        userId: user._id?.toString(),
        username: user.username,
        action: 'VIEW_ALL_ORDERS',
        entity: 'ORDER',
        ip: req?.ip,
        endpoint: req?.originalUrl || '/orders',
        details: { count: orders.length },
      });
    }

    return orders;
  }

  // ---------------- FIND ONE ORDER ----------------
  async findOne(orderId: string, user?: any, req?: any): Promise<OrderDocument> {
    if (!Types.ObjectId.isValid(orderId)) throw new BadRequestException('ID commande invalide');

    const order = await this.orderModel
      .findById(orderId)
      .populate('customerId')
      .populate('items.productId')
      .exec();

    if (!order) throw new NotFoundException('Commande non trouvée');

    // ✅ Audit: Consultation commande spécifique
    if (user) {
      await this.auditClient.log({
        userId: user._id?.toString(),
        username: user.username,
        action: 'VIEW_ONE_ORDER',
        entity: 'ORDER',
        ip: req?.ip,
        endpoint: req?.originalUrl || `/orders/${orderId}`,
        details: {
          orderId,
          customerId: order.customerId,
          totalAmount: order.totalAmount,
          itemsCount: order.items.length,
        },
      });
    }

    return order;
  }

  // ---------------- UPDATE ORDER ----------------
  async updateOrder(orderId: string, dto: CreateOrderDto, user?: any, req?: any): Promise<OrderDocument> {
    if (!Types.ObjectId.isValid(orderId)) throw new BadRequestException('ID commande invalide');
    if (!Array.isArray(dto.items) || dto.items.length === 0)
      throw new BadRequestException('Le champ items doit être un tableau non vide');

    const order = await this.orderModel.findById(orderId).exec();
    if (!order) throw new NotFoundException('Commande non trouvée');

    const oldItems = [...order.items];
    const oldTotal = order.totalAmount;
    let totalAmount = 0;
    const updatedItems: OrderItem[] = [];
    const productDetails = [];

    for (const item of dto.items) {
      const product = await this.productService.findOne(item.productId);
      if (!product) throw new NotFoundException(`Produit ${item.productId} non trouvé`);
      if (product.stock < item.quantity)
        throw new BadRequestException(`Stock insuffisant pour ${product.name}`);

      await this.productService.removeStock(item.productId, item.quantity);

      totalAmount += product.price * item.quantity;

      productDetails.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      });

      updatedItems.push({
        productId: new Types.ObjectId(item.productId),
        quantity: item.quantity,
      });
    }

    // Remettre le stock des anciens items
    for (const oldItem of oldItems) {
      await this.productService.addStock(oldItem.productId.toString(), oldItem.quantity);
    }

    order.items = updatedItems;
    order.customerId = new Types.ObjectId(dto.customerId);
    order.totalAmount = totalAmount;

    const updatedOrder = await order.save();

    // ✅ Audit: Modification commande
    await this.auditClient.log({
      userId: user?._id?.toString(),
      username: user?.username,
      action: 'UPDATE_ORDER',
      entity: 'ORDER',
      ip: req?.ip,
      endpoint: req?.originalUrl || `/orders/${orderId}`,
      details: {
        orderId,
        oldTotal,
        newTotal: totalAmount,
        customerId: dto.customerId,
        items: productDetails,
      },
    });

    return updatedOrder;
  }

  // ---------------- DELETE ORDER ----------------
  async removeOrder(orderId: string, user?: any, req?: any): Promise<void> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) throw new NotFoundException('Commande non trouvée');

    // Remettre le stock
    for (const item of order.items) {
      await this.productService.addStock(item.productId.toString(), item.quantity);
    }

    await this.orderModel.findByIdAndDelete(orderId).exec();

    // ✅ Audit: Suppression commande
    await this.auditClient.log({
      userId: user?._id?.toString(),
      username: user?.username,
      action: 'DELETE_ORDER',
      entity: 'ORDER',
      ip: req?.ip,
      endpoint: req?.originalUrl || `/orders/${orderId}`,
      details: {
        orderId,
        customerId: order.customerId,
        totalAmount: order.totalAmount,
        itemsCount: order.items.length,
      },
    });
  }

  // ---------------- TOTAL REVENUE ----------------
  async getTotalOrderAmount(user?: any, req?: any): Promise<{ totalOrderAmount: number }> {
    const orders = await this.orderModel.find().exec();
    const totalOrderAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // ✅ Audit: Consultation revenu total
    if (user) {
      await this.auditClient.log({
        userId: user._id?.toString(),
        username: user.username,
        action: 'VIEW_TOTAL_REVENUE',
        entity: 'ORDER',
        ip: req?.ip,
        endpoint: req?.originalUrl || '/orders/total',
        details: { totalOrderAmount },
      });
    }

    return { totalOrderAmount };
  }
}