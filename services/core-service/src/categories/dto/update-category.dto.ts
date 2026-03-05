import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  category?: string;
}