// purchase.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { ProductsService } from '../products/products.service';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectModel(Purchase.name)
    private purchaseModel: Model<PurchaseDocument>,
    private productService: ProductsService,
  ) {}

  // CREATE
  async createPurchase(dto: CreatePurchaseDto) {
    console.log('👉 CREATE PURCHASE CALLED');

    if (!dto.supplierId) {
      throw new NotFoundException('supplierId is required');
    }

    if (!dto.items?.length) {
      throw new NotFoundException('items are required');
    }

    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    const purchase = await this.purchaseModel.create({
      supplierId: dto.supplierId,
      items: dto.items,
      totalAmount,
    });

    console.log('👉 PURCHASE SAVED:', purchase);

    for (const item of dto.items) {
      await this.productService.addStock(
        item.productId.toString(),
        item.quantity,
      );
    }

    return purchase;
  }

  // FIND ALL
  async findAll() {
    return this.purchaseModel
      .find()
      .populate('supplierId')
      .populate('items.productId')
      .exec();
  }

  // FIND ONE
  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID');
    }

    const purchase = await this.purchaseModel
      .findById(id)
      .populate('supplierId')
      .populate('items.productId')
      .exec();

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    return purchase;
  }

  // TOTAL
  async getTotalPurchaseAmount() {
    const result = await this.purchaseModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    return result[0]?.total || 0;
  }

  // UPDATE
 async update(id: string, dto: UpdatePurchaseDto) {
  const purchase = await this.purchaseModel.findById(id);

  if (!purchase) {
    throw new NotFoundException('Purchase not found');
  }

  const updatedItems = dto.items ?? purchase.items;

  const totalAmount = updatedItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  purchase.items = updatedItems as any;

  purchase.supplierId = dto.supplierId
    ? new Types.ObjectId(dto.supplierId)
    : purchase.supplierId;

  purchase.totalAmount = totalAmount;

  await purchase.save();

  return purchase;
}
  // DELETE
  async remove(id: string) {
    const purchase = await this.purchaseModel.findById(id);

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    await this.purchaseModel.findByIdAndDelete(id);
  }

  // PDF
  async generateInvoice(id: string, res: Response) {
    const purchase = await this.findOne(id);

    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=purchase_${id}.pdf`,
    );

    doc.pipe(res);

    doc.fontSize(20).text('Purchase Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Total: ${purchase.totalAmount}`);

    doc.end();
  }
}