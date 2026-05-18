import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PurchaseDocument = Purchase & Document;

/* -------------------- PURCHASE ITEM -------------------- */
@Schema({ _id: false })
export class PurchaseItem {

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;
}

export const PurchaseItemSchema = SchemaFactory.createForClass(PurchaseItem);

/* -------------------- PURCHASE -------------------- */
@Schema({ timestamps: true })
export class Purchase {

  @Prop({ type: Types.ObjectId, ref: 'Supplier', required: true })
  supplierId: Types.ObjectId;

  @Prop({ type: [PurchaseItemSchema], required: true })
  items: PurchaseItem[];

  @Prop({ required: true, min: 0 })
  totalAmount: number;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);