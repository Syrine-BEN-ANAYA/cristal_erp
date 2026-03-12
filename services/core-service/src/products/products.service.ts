import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto, requester: any): Promise<Product> {
    const stock = createProductDto.stock ?? createProductDto.initialQuantity ?? 0;
    const createdProduct = new this.productModel({
      ...createProductDto,
      stock,
    });
    return createdProduct.save();
  }

  async findAll(requester: any): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string, requester: any): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, requester: any): Promise<Product> {
    const product = await this.productModel.findByIdAndUpdate(
      id,
      updateProductDto,
      { new: true, runValidators: true }
    ).exec();
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async remove(id: string, requester: any): Promise<{ message: string }> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return { message: 'Product deleted successfully' };
  }

  // Internal methods – no requester needed
  async addStock(productId: string, quantity: number): Promise<void> {
    const result = await this.productModel.updateOne(
      { _id: productId },
      { $inc: { stock: quantity } }
    );

    if (result.modifiedCount === 0) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }
  }

  async removeStock(productId: string, quantity: number): Promise<void> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    if (product.stock < quantity) {
      throw new BadRequestException(`Insufficient stock for product ${productId}`);
    }

    await this.productModel.updateOne(
      { _id: productId },
      { $inc: { stock: -quantity } }
    );
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
    return result.modifiedCount > 0;
  }

  async getLowStockProducts(): Promise<Product[]> {
    return this.productModel.find({
      $expr: { $lt: ["$stock", "$threshold"] }
    }).exec();
  }
}