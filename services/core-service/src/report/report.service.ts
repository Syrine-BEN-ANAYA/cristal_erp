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
    // Récupérer toutes les commandes avec populates
    const orders = await this.orderModel.find()
      .populate('items.productId')
      .populate('customerId')
      .exec();

    const purchases = await this.purchaseModel.find().exec();

    // Calcul des totaux (s'assurer que ce sont des nombres)
    const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalPurchases = purchases.reduce((sum, purchase) => sum + (purchase.totalAmount || 0), 0);
    const profit = totalSales - totalPurchases;

    // Récupérer les produits en stock faible (exemple : stock < 15)
    const lowStockProducts = await this.productModel.find({ stock: { $lt: 15 } }).exec();

    // Retourner le rapport avec les commandes
    return {
      totalSales,
      totalPurchases,
      profit,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.map(p => ({
        id: p._id,
        name: p.name,
        stock: p.stock,
        threshold: 15,
      })),
      orders: orders.map(order => ({
        id: order._id,
        date: order.createdAt,
        total: order.totalAmount,
      })),
    };
  }
}