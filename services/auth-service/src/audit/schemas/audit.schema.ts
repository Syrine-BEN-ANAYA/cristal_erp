import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditDocument = Audit & Document;

@Schema({ timestamps: true })
export class Audit {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  action!: string;

  @Prop({ required: true })
  entity!: string;

  @Prop()
  ip?: string;

  @Prop()
  endpoint?: string;

  @Prop({ default: Date.now })
  timestamp!: Date;
}

export const AuditSchema = SchemaFactory.createForClass(Audit);