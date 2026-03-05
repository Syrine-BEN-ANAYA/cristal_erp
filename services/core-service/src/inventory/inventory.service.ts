// src/inventory/inventory.service.ts
import { Injectable, NotFoundException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from '../products/products.service';
import { AlertsService } from '../alerts/alerts.service';
import { InventoryItem, InventoryItemDocument } from './schemas/inventory.schema';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';
import { ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(InventoryItem.name)
    private inventoryModel: Model<InventoryItemDocument>,

    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,

    @Inject(forwardRef(() => AlertsService))
    private readonly alertsService: AlertsService,
  ) {}

  // --- FORMAT RESPONSE ---
  private formatInventoryResponse(product: ProductDocument, inventory?: InventoryItemDocument) {
    return {
      productId: product._id.toString(),
      productName: product.name,
      totalQuantity: inventory ? inventory.quantity : Number(product.initialQuantity ?? 0),
      history: inventory ? inventory.history : [],
    };
  }

  // --- GET OR CREATE ITEM ---
  private async getInventoryItem(product: ProductDocument): Promise<InventoryItemDocument> {
    let item = await this.inventoryModel.findOne({ productId: product._id }).exec();
    if (!item) {
      item = new this.inventoryModel({
        productId: product._id,
        quantity: Number(product.initialQuantity ?? 0),
        history: [],
      });
      await item.save();
    }
    return item;
  }

  // --- STOCK IN ---
  async stockIn(dto: StockInDto) {
    const product = await this.productsService.findOne(dto.productId);
    if (!product) throw new NotFoundException('Produit non trouvé');

    const item = await this.getInventoryItem(product);

    item.quantity += Number(dto.quantity);
    item.history.push({ type: 'IN', quantity: Number(dto.quantity), date: new Date() });

    await item.save();
    await this.alertsService.checkAlert(dto.productId, item.quantity);

    return this.formatInventoryResponse(product, item);
  }

  // --- STOCK OUT ---
 async stockOut(dto: StockOutDto) {
  const product = await this.productsService.findOne(dto.productId);
  if (!product) throw new NotFoundException('Produit non trouvé');

  const item = await this.getInventoryItem(product);

  if (dto.quantity > item.quantity) {
    throw new BadRequestException(`Stock insuffisant. Disponible: ${item.quantity}`);
  }

  // --- Met à jour le stock uniquement ---
  item.quantity -= Number(dto.quantity);
  item.history.push({ type: 'OUT', quantity: Number(dto.quantity), date: new Date() });
  await item.save();

  // --- Vérifie les alertes ---
  await this.alertsService.checkAlert(dto.productId, item.quantity);

  // --- NE PAS créer l’ordre ici ! ---
  return this.formatInventoryResponse(product, item);
}

  // --- CHECK STOCK ---
  async checkStock(productId: string) {
    const product = await this.productsService.findOne(productId);
    if (!product) throw new NotFoundException('Produit non trouvé');

    const item = await this.getInventoryItem(product);
    return this.formatInventoryResponse(product, item);
  }

  // --- GET ALL INVENTORY ---
  async getAll() {
    const products = await this.productsService.findAll();
    const inventoryItems = await this.inventoryModel.find().exec();

    return products.map(product => {
      const item = inventoryItems.find(i => i.productId.toString() === product._id.toString());
      return this.formatInventoryResponse(product, item);
    });
  }

  // --- REBUILD INVENTORY ---
  async rebuildInventory() {
    const products = await this.productsService.findAll();
    await this.inventoryModel.deleteMany({});

    for (const product of products) {
      await this.inventoryModel.create({
        productId: product._id,
        quantity: Number(product.initialQuantity ?? 0),
        history: [],
      });
    }

    return { message: 'Inventaire reconstruit à partir des produits' };
  }
}