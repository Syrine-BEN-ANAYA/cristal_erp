import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PurchaseDocument = Purchase & Document;

// Sous-document pour un item d'achat
@Schema({ _id: false }) // Pas besoin d'_id pour les sous-documents si tu veux
export class PurchaseItem {

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId | any; // 'any' pour le populate

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;

}

export const PurchaseItemSchema = SchemaFactory.createForClass(PurchaseItem);

// Schema principal d'achat
@Schema({ timestamps: true })
export class Purchase {

  @Prop({ type: Types.ObjectId, ref: 'Supplier', required: true })
  supplierId: Types.ObjectId | any; // 'any' pour le populate

  @Prop({ type: [PurchaseItemSchema], required: true })
  items: PurchaseItem[];

  @Prop({ required: true, min: 0 })
  totalAmount: number;

}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);