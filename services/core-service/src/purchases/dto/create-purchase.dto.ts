import {
  IsMongoId,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

/* ---------------- ITEM ---------------- */
export class PurchaseItemDto {

  @IsMongoId()
  productId: string;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantity: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number;
}

/* ---------------- PURCHASE ---------------- */
export class CreatePurchaseDto {

  @IsMongoId()
  supplierId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[];
}