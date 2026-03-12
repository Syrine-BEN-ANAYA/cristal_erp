import { IsString, IsOptional, IsNotEmpty, IsEmail } from 'class-validator';

export class UpdateSupplierDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;
}