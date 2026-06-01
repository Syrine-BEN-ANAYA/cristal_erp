import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  PROD_USER = 'PROD_USER',
  HR_USER = 'HR_USER',
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username!: string;


  @Prop({ required: true, select: false })
  password!: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.PROD_USER })
  role!: UserRole;

  @Prop({ default: true })
  mustChangePassword!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);