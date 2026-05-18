import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  initialQuantity: number;

  @Prop({ default: 0 })
  stock: number;

  @Prop({ default: 10 })
  threshold: number;

  @Prop({ type: Types.ObjectId, ref: 'Supplier', required: false })
  supplierId?: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);