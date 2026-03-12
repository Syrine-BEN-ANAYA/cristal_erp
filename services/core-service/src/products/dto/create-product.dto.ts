import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  initialQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsMongoId()
  supplierId?: Types.ObjectId;

  @IsNumber()
  @Min(10)
  threshold: number;
}