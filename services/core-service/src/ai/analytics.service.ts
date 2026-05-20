// analytics.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Order } from '../orders/schemas/order.schema';
import { Product } from '../products/schemas/product.schema';
import { Customer } from '../customers/schemas/customer.schema';
import { Supplier } from '../suppliers/schemas/supplier.schema';

@Injectable()
export class AnalyticsService {

  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<Order>,

    @InjectModel(Product.name)
    private productModel: Model<Product>,

    @InjectModel(Customer.name)
    private customerModel: Model<Customer>,

    @InjectModel(Supplier.name)
    private supplierModel: Model<Supplier>,
  ) {}

  // =====================================================
  // TOTAL REVENUE
  // =====================================================
  async getTotalRevenue() {

    const result = await this.orderModel.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: '$totalAmount',
          },
        },
      },
    ]);

    return {
      totalRevenue:
        result[0]?.totalRevenue || 0,
    };
  }

  // =====================================================
  // TOTAL ORDERS
  // =====================================================
  async getOrdersCount() {

    const totalOrders =
      await this.orderModel.countDocuments();

    return {
      totalOrders,
    };
  }

  // =====================================================
  // TODAY ORDERS
  // =====================================================
  async getTodayOrders() {

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.orderModel
      .find({
        createdAt: {
          $gte: start,
          $lte: end,
        },
      })
      .populate('customerId')
      .populate('items.productId')
      .lean();
  }

  // =====================================================
  // RECENT ORDERS
  // =====================================================
  async getRecentOrders(limit = 10) {

    return this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('customerId')
      .populate('items.productId')
      .lean();
  }

  // =====================================================
  // BIGGEST ORDERS
  // =====================================================
  async getBiggestOrders(limit = 5) {

    return this.orderModel
      .find()
      .sort({ totalAmount: -1 })
      .limit(limit)
      .populate('customerId')
      .populate('items.productId')
      .lean();
  }

  // =====================================================
  // ORDERS ABOVE AMOUNT
  // =====================================================
  async getOrdersAboveAmount(amount: number) {

    return this.orderModel
      .find({
        totalAmount: {
          $gte: amount,
        },
      })
      .sort({ totalAmount: -1 })
      .populate('customerId')
      .populate('items.productId')
      .lean();
  }

  // =====================================================
  // AVERAGE ORDER VALUE
  // =====================================================
  async getAverageOrderValue() {

    const result = await this.orderModel.aggregate([
      {
        $group: {
          _id: null,
          averageOrderValue: {
            $avg: '$totalAmount',
          },
        },
      },
    ]);

    return {
      averageOrderValue:
        result[0]?.averageOrderValue || 0,
    };
  }

  // =====================================================
  // TOP PRODUCTS
  // =====================================================
  async getTopProducts(limit = 10) {

    return this.orderModel.aggregate([

      {
        $unwind: '$items',
      },

      {
        $group: {
          _id: '$items.productId',

          totalSold: {
            $sum: '$items.quantity',
          },
        },
      },

      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },

      {
        $unwind: '$product',
      },

      {
        $project: {
          name: '$product.name',

          price: '$product.price',

          totalSold: 1,

          revenue: {
            $multiply: [
              '$product.price',
              '$totalSold',
            ],
          },
        },
      },

      {
        $sort: {
          totalSold: -1,
        },
      },

      {
        $limit: limit,
      },
    ]);
  }

  // =====================================================
  // MOST EXPENSIVE PRODUCTS
  // =====================================================
  async getMostExpensiveProducts(limit = 10) {

    return this.productModel
      .find()
      .sort({ price: -1 })
      .limit(limit)
      .lean();
  }

  // =====================================================
  // CHEAPEST PRODUCTS
  // =====================================================
  async getCheapestProducts(limit = 10) {

    return this.productModel
      .find()
      .sort({ price: 1 })
      .limit(limit)
      .lean();
  }

  // =====================================================
  // OUT OF STOCK PRODUCTS
  // =====================================================
  async getOutOfStockProducts() {

    return this.productModel
      .find({
        stock: 0,
      })
      .lean();
  }

  // =====================================================
  // STOCK ALERTS
  // =====================================================
  async getStockAlerts() {

    return this.productModel.aggregate([

      {
        $project: {
          name: 1,
          stock: 1,
          threshold: 1,

          status: {
            $cond: [
              {
                $lte: [
                  '$stock',
                  '$threshold',
                ],
              },
              'LOW_STOCK',
              'OK',
            ],
          },
        },
      },

      {
        $match: {
          status: 'LOW_STOCK',
        },
      },
    ]);
  }

  // =====================================================
  // HIGHEST STOCK PRODUCTS
  // =====================================================
  async getHighestStockProducts(limit = 10) {

    return this.productModel
      .find()
      .sort({ stock: -1 })
      .limit(limit)
      .lean();
  }

  // =====================================================
  // INVENTORY VALUE
  // =====================================================
  async getInventoryValue() {

    const result =
      await this.productModel.aggregate([

        {
          $project: {
            value: {
              $multiply: [
                '$stock',
                '$price',
              ],
            },
          },
        },

        {
          $group: {
            _id: null,

            totalInventoryValue: {
              $sum: '$value',
            },
          },
        },
      ]);

    return {
      totalInventoryValue:
        result[0]?.totalInventoryValue || 0,
    };
  }

  // =====================================================
  // TOP CUSTOMERS
  // =====================================================
  async getTopCustomers(limit = 10) {

    return this.orderModel.aggregate([

      {
        $group: {
          _id: '$customerId',

          totalSpent: {
            $sum: '$totalAmount',
          },

          ordersCount: {
            $sum: 1,
          },
        },
      },

      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer',
        },
      },

      {
        $unwind: '$customer',
      },

      {
        $project: {
          customerName: {
            $concat: [
              '$customer.firstName',
              ' ',
              '$customer.lastName',
            ],
          },

          totalSpent: 1,
          ordersCount: 1,
        },
      },

      {
        $sort: {
          totalSpent: -1,
        },
      },

      {
        $limit: limit,
      },
    ]);
  }

  // =====================================================
  // ALL CUSTOMERS
  // =====================================================
  async getAllCustomers() {

    return this.customerModel.find().lean();
  }

  // =====================================================
  // ALL PRODUCTS
  // =====================================================
  async getAllProducts() {

    return this.productModel.find().lean();
  }

  // =====================================================
  // ALL SUPPLIERS
  // =====================================================
  async getAllSuppliers() {

    return this.supplierModel.find().lean();
  }
}