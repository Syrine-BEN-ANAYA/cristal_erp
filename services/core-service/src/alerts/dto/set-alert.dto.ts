import { IsString, IsNumber, Min } from 'class-validator';

export class SetAlertDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  threshold: number;
}