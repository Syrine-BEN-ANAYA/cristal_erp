import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import axios from 'axios';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  private readonly N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
  private readonly DEFAULT_THRESHOLD = 10; // seuil par défaut si non défini

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  // -------------------- CRUD --------------------
  async create(createProductDto: CreateProductDto, requester: any): Promise<Product> {
    const stock = createProductDto.stock ?? createProductDto.initialQuantity ?? 0;
    const threshold = createProductDto.threshold ?? this.DEFAULT_THRESHOLD;

    const createdProduct = new this.productModel({
      ...createProductDto,
      stock,
      threshold,
    });

    return createdProduct.save();
  }

  async findAll(requester: any): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string, requester: any): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException(`Product with id ${id} not found`);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, requester: any): Promise<Product> {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      updateProductDto,
      { new: true, runValidators: true }
    ).exec();
    if (!product) throw new NotFoundException(`Product with id ${id} not found`);

    // Vérifie le stock après update
    await this.checkAndAlertLowStock();
    return product;
  }

  async remove(id: string, requester: any): Promise<{ message: string }> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Product with id ${id} not found`);
    return { message: 'Product deleted successfully' };
  }

  // -------------------- Stock management --------------------
  async addStock(productId: string, quantity: number): Promise<void> {
    const result = await this.productModel.updateOne(
      { _id: productId },
      { $inc: { stock: quantity } }
    );
    if (result.modifiedCount === 0) throw new NotFoundException(`Product with id ${productId} not found`);

    await this.checkAndAlertLowStock();
  }

  async removeStock(productId: string, quantity: number): Promise<void> {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException(`Product with id ${productId} not found`);
    if (product.stock < quantity) throw new BadRequestException(`Insufficient stock for product ${productId}`);

    await this.productModel.updateOne(
      { _id: productId },
      { $inc: { stock: -quantity } }
    );

    await this.checkAndAlertLowStock();
  }

  async decrementStockAtomic(
    productId: string,
    quantity: number,
    session?: ClientSession,
  ): Promise<boolean> {
    const result = await this.productModel.updateOne(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { session },
    );
    if (result.modifiedCount > 0) await this.checkAndAlertLowStock();
    return result.modifiedCount > 0;
  }

  async getLowStockProducts(): Promise<Product[]> {
    return this.productModel.find({
      $expr: { $lt: ["$stock", "$threshold"] }
    }).exec();
  }

  // -------------------- n8n Integration --------------------
  private async triggerLowStockAlert(product: ProductDocument) {
    if (!this.N8N_WEBHOOK_URL) return console.warn('N8N_WEBHOOK_URL not set. Skipping alert.');

    try {
      await axios.post(
        this.N8N_WEBHOOK_URL,
        {
          productId: product.id,
          name: product.name,
          stock: product.stock,
          threshold: product.threshold,
        },
        { timeout: 5000 } // timeout 5s pour éviter blocage
      );
    } catch (err) {
      console.error('Failed to trigger n8n alert', err);
    }
  }

  async checkAndAlertLowStock() {
    const lowStockProducts = await this.getLowStockProducts() as ProductDocument[];
    for (const product of lowStockProducts) {
      await this.triggerLowStockAlert(product);
    }
  }
}