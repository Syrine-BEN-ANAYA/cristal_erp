import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AlertDocument = Alert & Document;

@Schema({ timestamps: true })
export class Alert {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  threshold: number; // seuil minimal pour déclencher l'alerte

  @Prop({ default: 0 })
  currentQuantity: number; // quantité actuelle du stock

  @Prop({ default: false })
  active: boolean; // true si alerte active
}

export const AlertSchema = SchemaFactory.createForClass(Alert);