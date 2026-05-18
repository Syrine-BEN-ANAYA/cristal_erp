import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContractDocument = Contract & Document;

@Schema({ timestamps: true })
export class Contract {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId!: Types.ObjectId;

  @Prop({ required: true })
  type!: string; // e.g., CDI, CDD, Internship, Freelance

  @Prop({ required: true })
  startDate!: Date;

  @Prop()
  endDate?: Date;

  @Prop({ required: true })
  salary!: number;

  @Prop({ default: 'active' })
  status!: string; // active, expired, terminated

  @Prop()
  position?: string;

  @Prop()
  description?: string;
}

export const ContractSchema = SchemaFactory.createForClass(Contract);
