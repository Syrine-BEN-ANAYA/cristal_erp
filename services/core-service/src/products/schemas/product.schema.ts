// product.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  categoryId: Types.ObjectId;

  @Prop({ required: true })
  price: number;

  @Prop()
  initialQuantity: number;

  @Prop({ type: Types.ObjectId }) // ← pas de ref
  supplierId: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);