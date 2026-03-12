import { Injectable, NotFoundException } from '@nestjs/common';
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
    // Initialiser le stock avec la quantité initiale si non fourni
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
      throw new NotFoundException(`Produit avec l'id ${id} non trouvé`);
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
      throw new NotFoundException(`Produit avec l'id ${id} non trouvé`);
    }
    return product;
  }

  async remove(id: string, requester: any): Promise<{ message: string }> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Produit avec l'id ${id} non trouvé`);
    }
    return { message: 'Produit supprimé avec succès' };
  }
// products.service.ts
async addStock(productId: string, quantity: number) {
  const result = await this.productModel.updateOne(
    { _id: productId },
    { $inc: { stock: quantity } } // augmente le stock
  );

  if (result.modifiedCount === 0) {
    throw new NotFoundException(`Product with id ${productId} not found`);
  }
}

async removeStock(productId: string, quantity: number) {

  const product = await this.productModel.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.stock < quantity) {
    throw new Error("Insufficient stock");
  }

  await this.productModel.updateOne(
    { _id: productId },
    { $inc: { stock: -quantity } }
  );

}
 async decrementStockAtomic(productId: string, quantity: number, session?: ClientSession) {
    const result = await this.productModel.updateOne(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { session },
    );
    return result.modifiedCount > 0;
  }

}