import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsMongoId } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  categoryId?: string;

@IsOptional()
@IsMongoId()
supplierId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  initialQuantity?: number;
}