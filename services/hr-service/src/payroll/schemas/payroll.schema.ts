import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PayrollDocument = Payroll & Document;

@Schema({ timestamps: true })
export class Payroll {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId!: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 12 })
  month!: number;

  @Prop({ required: true, min: 2000, max: 2100 })
  year!: number;

  @Prop({ required: true, min: 0 })
  basicSalary!: number;

  @Prop({ default: 0, min: 0 })
  bonuses?: number;

  @Prop({ default: 0, min: 0 })
  deductions?: number;

  @Prop({ required: true, min: 0 })
  netSalary!: number;

  @Prop({ default: 'draft', enum: ['draft', 'processed', 'paid'] })
  status?: string;

  @Prop()
  paymentDate?: Date;

  @Prop()
  processedAt?: Date;

  @Prop()
  notes?: string;
}

export const PayrollSchema = SchemaFactory.createForClass(Payroll);

// Index composé pour éviter les doublons (même employé, même mois, même année)
PayrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });
