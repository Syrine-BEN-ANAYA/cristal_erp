import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // ← Import de Types
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import * as jwt from 'jsonwebtoken';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
  ) {}

  private getCleanToken(token: string): string {
    if (!token) throw new UnauthorizedException('Token manquant');
    return token.replace('Bearer ', '');
  }

  private getConfig(cleanToken: string): AxiosRequestConfig {
    return { headers: { Authorization: `Bearer ${cleanToken}` } };
  }

  private getUserIdFromToken(token: string): string {
    const decoded: any = jwt.decode(this.getCleanToken(token));
    return decoded?.sub;
  }

  // ---------------- CREATE ORDER ----------------
  async create(dto: CreateOrderDto, token: string) {
    const cleanToken = this.getCleanToken(token);
    const config = this.getConfig(cleanToken);
    const userId = this.getUserIdFromToken(token);

    // Vérifier le client
    try {
      const res = await axios.get(`http://localhost:3003/customers/${dto.customerId}`, config);
      if (!res.data) throw new NotFoundException('Customer not found');
    } catch (err: any) {
      if (err.response?.status === 404) throw new NotFoundException('Customer not found');
      throw new InternalServerErrorException('Failed to verify customer');
    }

    let total = 0;
    // Typage explicite des items à sauvegarder
    const itemsToSave: { productId: Types.ObjectId; quantity: number }[] = [];

    for (const item of dto.items) {
      // Récupérer le produit
      let product;
      try {
        const res = await axios.get(`http://localhost:3002/products/${item.productId}`, config);
        product = res.data;
        if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      } catch (err: any) {
        if (err.response?.status === 404) throw new NotFoundException(`Product ${item.productId} not found`);
        throw new InternalServerErrorException('Failed to fetch product');
      }

      // Vérifier le stock
      try {
        const stockRes = await axios.get(`http://localhost:3002/inventory/${item.productId}`, config);
        if (stockRes.data.totalQuantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}. Available: ${stockRes.data.totalQuantity}`,
          );
        }
      } catch (err: any) {
        if (err instanceof BadRequestException) throw err;
        throw new InternalServerErrorException('Failed to check stock');
      }

      total += product.price * item.quantity;
      itemsToSave.push({
        productId: new Types.ObjectId(item.productId), // conversion en ObjectId
        quantity: item.quantity,
      });
    }

    // Créer la commande
    const order = new this.orderModel({
      customerId: new Types.ObjectId(dto.customerId),
      items: itemsToSave,
      userId: userId ? new Types.ObjectId(userId) : undefined,
      total,
    });

    let savedOrder;
    try {
      savedOrder = await order.save();
    } catch (err) {
      throw new InternalServerErrorException('Failed to create order');
    }

    // Décrémenter le stock pour chaque produit
    try {
      for (const item of dto.items) {
        await axios.post(
          'http://localhost:3002/inventory/out',
          { productId: item.productId, quantity: item.quantity },
          config,
        );
      }
    } catch (err) {
      // Rollback : supprimer la commande
      await this.orderModel.findByIdAndDelete(savedOrder._id);
      throw new InternalServerErrorException('Failed to update stock, order cancelled');
    }

    return savedOrder;
  }

 // ---------------- GET ALL ----------------
async findAll() {
  return this.orderModel.find().exec(); // sans populate
}

// ---------------- GET ONE ----------------
async findOne(id: string) {
  const order = await this.orderModel.findById(id).exec();
  if (!order) throw new NotFoundException('Order not found');
  return order;
}

  // ---------------- DELETE ORDER ----------------
  async remove(id: string, token: string) {
    const cleanToken = this.getCleanToken(token);
    const config = this.getConfig(cleanToken);

    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    // Remettre le stock pour chaque produit
    try {
      for (const item of order.items) {
        await axios.post(
          'http://localhost:3002/inventory/in',
          { productId: item.productId, quantity: item.quantity },
          config,
        );
      }
    } catch (err) {
      throw new InternalServerErrorException('Failed to restore stock');
    }

    await this.orderModel.findByIdAndDelete(id);
    return { message: 'Order deleted successfully' };
  }

  // ---------------- UPDATE ORDER ----------------
  async update(id: string, dto: UpdateOrderDto, token: string) {
    const cleanToken = this.getCleanToken(token);
    const config = this.getConfig(cleanToken);
    const userId = this.getUserIdFromToken(token);

    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    // Sauvegarder les anciens items
    const oldItems = order.items.map(item => ({
      productId: item.productId.toString(),
      quantity: item.quantity,
    }));

    // Mise à jour du client si nécessaire
    if (dto.customerId && dto.customerId !== order.customerId.toString()) {
      try {
        const res = await axios.get(`http://localhost:3003/customers/${dto.customerId}`, config);
        if (!res.data) throw new NotFoundException('Customer not found');
      } catch (err: any) {
        if (err.response?.status === 404) throw new NotFoundException('Customer not found');
        throw new InternalServerErrorException('Failed to verify customer');
      }
      order.customerId = new Types.ObjectId(dto.customerId); // conversion
    }

    // Mise à jour des items
    if (dto.items) {
      // 1. Remettre l'ancien stock
      try {
        for (const item of oldItems) {
          await axios.post(
            'http://localhost:3002/inventory/in',
            { productId: item.productId, quantity: item.quantity },
            config,
          );
        }
      } catch (err) {
        throw new InternalServerErrorException('Failed to restore old stock during update');
      }

      // 2. Vérifier et enlever le nouveau stock
      let newTotal = 0;
      const newItems: { productId: Types.ObjectId; quantity: number }[] = [];

      for (const item of dto.items) {
        let product;
        try {
          const res = await axios.get(`http://localhost:3002/products/${item.productId}`, config);
          product = res.data;
          if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
        } catch (err: any) {
          // En cas d'échec, on remet le stock qu'on vient d'enlever (pour les produits déjà traités)
          await Promise.all(
            newItems.map(i =>
              axios.post('http://localhost:3002/inventory/in', { productId: i.productId.toString(), quantity: i.quantity }, config).catch(() => {}),
            ),
          );
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        try {
          const stockRes = await axios.get(`http://localhost:3002/inventory/${item.productId}`, config);
          if (stockRes.data.totalQuantity < item.quantity) {
            // Stock insuffisant : remettre tout le stock déjà enlevé
            await Promise.all(
              newItems.map(i =>
                axios.post('http://localhost:3002/inventory/in', { productId: i.productId.toString(), quantity: i.quantity }, config).catch(() => {}),
              ),
            );
            throw new BadRequestException(
              `Insufficient stock for product ${product.name}. Available: ${stockRes.data.totalQuantity}`,
            );
          }
        } catch (err: any) {
          if (err instanceof BadRequestException) throw err;
          throw new InternalServerErrorException('Failed to check stock');
        }

        newTotal += product.price * item.quantity;
        newItems.push({
          productId: new Types.ObjectId(item.productId),
          quantity: item.quantity,
        });
      }

      // Maintenant on peut enlever le nouveau stock
      try {
        for (const item of newItems) {
          await axios.post(
            'http://localhost:3002/inventory/out',
            { productId: item.productId.toString(), quantity: item.quantity },
            config,
          );
        }
      } catch (err) {
        // En cas d'échec, on remet l'ancien stock (celui qu'on avait remis)
        await Promise.all(
          oldItems.map(item =>
            axios.post('http://localhost:3002/inventory/out', { productId: item.productId, quantity: item.quantity }, config).catch(() => {}),
          ),
        );
        throw new InternalServerErrorException('Failed to update new stock');
      }

      order.items = newItems;
      order.total = newTotal;
    }

    order.userId = userId ? new Types.ObjectId(userId) : order.userId;

    try {
      await order.save();
    } catch (err) {
      throw new InternalServerErrorException('Failed to save updated order');
    }

    return order;
  }
  async deleteByMonth(month: string, token: string) {
  const cleanToken = this.getCleanToken(token);
  const config = this.getConfig(cleanToken);
  const [year, monthNum] = month.split('-').map(Number);
  const start = new Date(year, monthNum - 1, 1);
  const end = new Date(year, monthNum, 1); // premier jour du mois suivant

  const orders = await this.orderModel.find({
    createdAt: { $gte: start, $lt: end }
  });

  if (orders.length === 0) {
    return { message: 'No orders found for this month' };
  }

  // Restaurer le stock pour chaque commande
  await Promise.all(
    orders.map(async (order) => {
      for (const item of order.items) {
        await axios.post(
          'http://localhost:3002/inventory/in',
          { productId: item.productId.toString(), quantity: item.quantity },
          config
        ).catch(err => console.error('Stock restore failed for item', item.productId, err));
      }
    })
  );

  // Supprimer les commandes
  await this.orderModel.deleteMany({ _id: { $in: orders.map(o => o._id) } });

  return { message: `Deleted ${orders.length} orders for ${month}` };
}
}