import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsMongoId } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  initialQuantity?: number;
  @IsOptional()
@IsMongoId()
supplierId?: string;
}