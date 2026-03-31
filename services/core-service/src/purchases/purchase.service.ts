import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { ProductsService } from '../products/products.service';
import PDFDocument from 'pdfkit';
import { Response } from 'express'; // Assure-toi que c’est bien express.Response

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
 
async update(id: string, dto: UpdatePurchaseDto): Promise<Purchase> {
  const purchase = await this.purchaseModel.findById(id);

  if (!purchase) {
    throw new NotFoundException(`Purchase not found`);
  }

  // 1️⃣ retirer ancien stock
  for (const item of purchase.items) {
    await this.productService.removeStock(
      item.productId.toString(),
      item.quantity,
    );
  }

  // 2️⃣ préparer nouvelles valeurs
  const updatedItems = dto.items ?? purchase.items;
  const supplierId = dto.supplierId ?? purchase.supplierId;

  // 3️⃣ recalcul total
  const totalAmount = updatedItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  // 4️⃣ appliquer update
  purchase.items = updatedItems as any;
  purchase.supplierId = supplierId as any;
  purchase.totalAmount = totalAmount;

  await purchase.save();

  // 5️⃣ ajouter nouveau stock
  for (const item of updatedItems) {
    await this.productService.addStock(
      item.productId.toString(),
      item.quantity,
    );
  }

  return purchase;
}
async remove(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) {
    throw new NotFoundException(`Purchase ID is invalid`);
  }

  const purchase = await this.purchaseModel.findById(id);
  if (!purchase) throw new NotFoundException(`Purchase not found`);

  // retirer le stock
  for (const item of purchase.items) {
    await this.productService.removeStock(item.productId.toString(), item.quantity);
  }

  // supprimer la purchase
  const deleted = await this.purchaseModel.findByIdAndDelete(id);
  if (!deleted) throw new NotFoundException(`Purchase not found during deletion`);
}
 async findOne(id: string): Promise<PurchaseDocument> {
    const purchase = await this.purchaseModel
      .findById(id)
      .populate('supplierId')
      .populate('items.productId')
      .exec();

    if (!purchase) throw new NotFoundException(`Purchase with id ${id} not found`);

    return purchase;
  }

  async generateInvoice(id: string, res: Response) {
    const purchase = await this.findOne(id);

    const doc = new PDFDocument({ margin: 50 });

    // Cast pour éviter erreur TypeScript
    const supplier = purchase.supplierId as any;

    // Configurer Express pour envoyer PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=purchase_${purchase._id.toString()}.pdf`,
    );
    doc.pipe(res as unknown as NodeJS.WritableStream);

    // Header
    doc.fontSize(20).text('Purchase Invoice', { align: 'center' });
    doc.moveDown();

    // Supplier & Date
    doc.fontSize(12).text(`Supplier: ${supplier.name || 'N/A'}`);
    doc.moveDown(2);

    // Table headers
    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 300;
    const unitPriceX = 370;
    const totalX = 450;

    doc.font('Helvetica-Bold');
    doc.text('Product', itemX, tableTop);
    doc.text('Quantity', qtyX, tableTop);
    doc.text('Unit Price', unitPriceX, tableTop);
    doc.text('Total', totalX, tableTop);
    doc.moveDown();

    doc.font('Helvetica');
    let y = tableTop + 20;

    purchase.items.forEach((item) => {
      const product = item.productId as any;
      const total = item.quantity * item.price;

      doc.text(product.name || 'N/A', itemX, y);
      doc.text(item.quantity.toString(), qtyX, y);
      doc.text(item.price.toFixed(2), unitPriceX, y);
      doc.text(total.toFixed(2), totalX, y);

      y += 20;
    });

    // Total Amount
    doc.moveDown(2);
    doc.fontSize(14).text(`Total Amount: $${purchase.totalAmount.toFixed(2)}`, {
      align: 'right',
    });

    doc.end();
  }

}
