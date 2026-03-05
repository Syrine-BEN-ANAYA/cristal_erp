import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InventoryItemDocument = InventoryItem & Document;

export class InventoryHistory {
  @Prop({ type: String, enum: ['IN', 'OUT'], required: true })
  type: 'IN' | 'OUT';

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Date, default: Date.now })
  date: Date;
}

@Schema()
export class InventoryItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, unique: true })
  productId: Types.ObjectId;

  @Prop({ default: 0 })
  quantity: number;

  @Prop({ type: [Object], default: [] })
  history: InventoryHistory[];
}

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);