import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true }) // ajoute createdAt et updatedAt
export class Category {
  @Prop({ required: true })
  category: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);