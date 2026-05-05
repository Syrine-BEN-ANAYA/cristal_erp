import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditDocument = Audit & Document;

@Schema({ timestamps: true })
export class Audit {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  action!: string;

  @Prop({ required: true })
  entity!: string;

  @Prop()
  ip?: string;

  @Prop()
  endpoint?: string;

  @Prop({ type: Object, default: null })
  details?: Record<string, any>;  // Pour stocker des infos supplémentaires
}

export const AuditSchema = SchemaFactory.createForClass(Audit);

// Index pour les requêtes fréquentes
AuditSchema.index({ userId: 1, createdAt: -1 });
AuditSchema.index({ action: 1, createdAt: -1 });