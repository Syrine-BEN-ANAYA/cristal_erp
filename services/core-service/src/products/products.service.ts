import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductThresholdDto } from './dto/product-threshold.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ProductService {
  private readonly DEFAULT_THRESHOLD = 10;

  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    private readonly eventBus: EventEmitter2,
  ) {
    console.log('✅ ProductService instantiated');
  }

  // -------------------- CRUD --------------------
  async create(createProductDto: CreateProductDto, requester: any): Promise<Product> {
    console.log('🟢 create called with:', createProductDto);
    const stock = createProductDto.stock ?? createProductDto.initialQuantity ?? 0;
    const threshold = createProductDto.threshold ?? this.DEFAULT_THRESHOLD;

    const newProduct = new this.productModel({
      ...createProductDto,
      stock,
      threshold,
    });

    const saved = await newProduct.save();
    console.log('🟢 Product created:', saved);
    return saved;
  }

  async findAll(requester: any): Promise<Product[]> {
    try {
      console.log('🟢 findAll called');
      const products = await this.productModel.find().exec();
      console.log('🟢 Products found:', products.length);
      return products;
    } catch (err) {
      console.error('❌ Error in findAll:', err);
      throw err;
    }
  }

 async findOne(id: string, requester: any): Promise<ProductDocument> { // ← ProductDocument, pas Product
  console.log('🟢 findOne called with id:', id);

  let product: ProductDocument | null;

  if (Types.ObjectId.isValid(id)) {
    product = await this.productModel.findById(id).exec();
  } else {
    product = await this.productModel.findOne({ slug: id }).exec();
  }

  if (!product) {
    console.log('❌ Product not found:', id);
    throw new NotFoundException(`Product not found: ${id}`);
  }

  console.log('🟢 Product found:', product);
  return product; // ← type ProductDocument
}

  async update(id: string, updateDto: UpdateProductDto, requester: any): Promise<Product> {
    console.log('🟢 update called with id:', id, 'data:', updateDto);

    const product = await this.findOne(id, requester); // réutilise findOne pour ObjectId ou slug

    Object.assign(product, updateDto);
    await product.save();

    if (product.stock <= product.threshold) {
      this.emitLowStockEvent(product);
    }

    console.log('🟢 Product updated:', product);
    return product;
  }

 async remove(id: string, requester: any): Promise<{ message: string }> {
  console.log('🟢 remove called with id:', id);

  const product = await this.findOne(id, requester);
  await product.deleteOne(); // ← remplacer remove() par deleteOne()
  
  console.log('🟢 Product deleted:', product);
  return { message: 'Product deleted successfully' };
}

  // -------------------- Stock management --------------------
  async addStock(productId: string, quantity: number): Promise<void> {
    console.log('🟢 addStock called:', productId, quantity);
    const res = await this.productModel.updateOne(
      { _id: productId },
      { $inc: { stock: quantity } },
    );

    if (res.modifiedCount === 0) {
      console.log('❌ Product not found for addStock:', productId);
      throw new NotFoundException(`Product with id ${productId} not found`);
    }
    console.log('🟢 Stock added successfully for:', productId);
  }

  async removeStock(productId: string, quantity: number): Promise<void> {
    console.log('🟢 removeStock called:', productId, quantity);
    const product = await this.productModel.findById(productId);
    if (!product) {
      console.log('❌ Product not found for removeStock:', productId);
      throw new NotFoundException(`Product with id ${productId} not found`);
    }
    if (product.stock < quantity) {
      console.log('❌ Insufficient stock for:', productId);
      throw new BadRequestException(`Insufficient stock for product ${productId}`);
    }

    product.stock -= quantity;
    await product.save();
    console.log('🟢 Stock removed, new stock:', product.stock);

    if (product.stock <= product.threshold) {
      this.emitLowStockEvent(product);
    }
  }

  private emitLowStockEvent(product: ProductDocument) {
    const event: ProductThresholdDto = {
      productId: product._id.toString(),
      productName: product.name,
      currentStock: product.stock,
      threshold: product.threshold,
    };
    console.log('⚠️ Low stock event emitted:', event);
    this.eventBus.emit('product.threshold.reached', event);
  }

  async decrementStockAtomic(
    productId: string,
    quantity: number,
    session?: ClientSession,
  ): Promise<boolean> {
    console.log('🟢 decrementStockAtomic called:', productId, quantity);
    const res = await this.productModel.updateOne(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { session },
    );
    console.log('🟢 decrement result:', res.modifiedCount);
    return res.modifiedCount > 0;
  }

  async getLowStockProducts(): Promise<Product[]> {
    console.log('🟢 getLowStockProducts called');
    const products = await this.productModel.find({
      $expr: { $lt: ["$stock", "$threshold"] },
    }).exec();
    console.log('🟢 Low stock products found:', products.length);
    return products;
  }
}