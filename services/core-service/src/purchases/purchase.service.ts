import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class PurchaseService {

  constructor(
    @InjectModel(Purchase.name)
    private purchaseModel: Model<PurchaseDocument>,
    private productService: ProductsService,
  ) {}

  async createPurchase(dto: CreatePurchaseDto) {

    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    const purchase = await this.purchaseModel.create({
      supplierId: dto.supplierId,
      items: dto.items,
      totalAmount,
    });

    // mise à jour du stock
    for (const item of dto.items) {
      await this.productService.addStock(
        item.productId.toString(),
        item.quantity,
      );
    }

    return purchase;
  }

  async findAll(): Promise<Purchase[]> {
    return this.purchaseModel
      .find()
      .populate('supplierId')
      .populate('items.productId')
      .exec();
  }

async getTotalPurchaseAmount(): Promise<number> {
  const result = await this.purchaseModel.aggregate([
    { $group: { _id: null, totalSum: { $sum: "$totalAmount" } } }
  ]);
  return result.length > 0 ? result[0].totalSum : 0;
}
  async findOne(id: string): Promise<Purchase> {

    const purchase = await this.purchaseModel
      .findById(id)
      .populate('supplierId')
      .populate('items.productId')
      .exec();

    if (!purchase) {
      throw new NotFoundException(`Purchase with id ${id} not found`);
    }

    return purchase;
  }

 async remove(id: string): Promise<void> {
  const purchase = await this.purchaseModel.findById(id);
  if (!purchase) throw new NotFoundException(`Purchase not found`);

  for (const item of purchase.items) {
    await this.productService.removeStock(item.productId.toString(), item.quantity);
  }

  await this.purchaseModel.findByIdAndDelete(id);
}


}
