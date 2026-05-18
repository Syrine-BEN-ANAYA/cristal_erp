import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Purchase, PurchaseDocument } from '../purchases/schemas/purchase.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Purchase.name) private purchaseModel: Model<PurchaseDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getGlobalReport() {
    const orders = await this.orderModel
      .find()
      .populate('items.productId')
      .populate('customerId')
      .exec();

    const purchases = await this.purchaseModel.find().exec();

    const totalSales = (orders || []).reduce(
      (sum: number, order: any) => sum + Number(order?.totalAmount || 0),
      0,
    );

    const totalPurchases = (purchases || []).reduce(
      (sum: number, purchase: any) =>
        sum + Number(purchase?.totalAmount || 0),
      0,
    );

    const profit = totalSales - totalPurchases;

    const lowStockProducts = await this.productModel
      .find({ stock: { $lt: 15 } })
      .exec();

    return {
      totalSales,
      totalPurchases,
      profit,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.map((p: any) => ({
        id: p._id,
        name: p.name,
        stock: p.stock,
        threshold: 15,
      })),
      orders: (orders || []).map((order: any) => ({
        id: order._id,
        date: order.createdAt,
        total: order.totalAmount,
      })),
    };
  }
}