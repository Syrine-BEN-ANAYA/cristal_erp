import { IsMongoId, IsArray, ValidateNested, ArrayMinSize, IsNumber, Min, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseItemDto {
  @IsMongoId()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreatePurchaseDto {
  @IsMongoId()
  supplierId: string;

  
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[];
}