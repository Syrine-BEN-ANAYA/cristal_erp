import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductDocument> {
    const product = new this.productModel({
      ...dto,
      stock: dto.stock ?? dto.initialQuantity ?? 0,
      initialQuantity: dto.initialQuantity ?? 0,
    });
    return product.save();
  }

  async findAll(): Promise<ProductDocument[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Produit non trouvé');
    return product;
  }

  async findLowStock(): Promise<ProductDocument[]> {
    return this.productModel.find({ stock: { $lte: Types.Decimal128.fromString('10') } }).exec();
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    const updated = await this.productModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Produit non trouvé');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const res = await this.productModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Produit non trouvé');
  }

  async addStock(id: string, quantity: number): Promise<ProductDocument> {
    const product = await this.findOne(id);
    product.stock += quantity;
    return product.save();
  }

  async removeStock(id: string, quantity: number): Promise<ProductDocument> {
    const product = await this.findOne(id);
    if (product.stock < quantity)
      throw new NotFoundException('Stock insuffisant');
    product.stock -= quantity;
    return product.save();
  }
}