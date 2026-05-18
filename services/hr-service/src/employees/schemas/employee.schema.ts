import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop()
  phoneNumber!: string;

  @Prop({ enum: ['male', 'female'] })
  gender!: string;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId!: Types.ObjectId;

  @Prop()
  position!: string;

  @Prop({ default: 'active' })
  status!: string;

  @Prop()
  hireDate!: Date;

  @Prop([String])
  skills!: string[];

  @Prop({ default: true })
  isActive!: boolean;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
