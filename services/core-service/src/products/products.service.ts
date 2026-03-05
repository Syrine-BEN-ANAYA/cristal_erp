import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { InventoryService } from '../inventory/inventory.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,

    @Inject(forwardRef(() => InventoryService))
    private readonly inventoryService: InventoryService,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductDocument> {
    const product = new this.productModel(dto);
    const savedProduct = await product.save();

    if (dto.initialQuantity && dto.initialQuantity > 0) {
      await this.inventoryService.stockIn({
        productId: savedProduct._id.toString(),
        quantity: dto.initialQuantity,
      });
    }

    return savedProduct;
  }

  async findAll(): Promise<ProductDocument[]> {
return this.productModel.find().exec();  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).populate('supplierId').exec(); // ← Ajout du populate
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    const product = await this.productModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findByIdAndDelete(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}