import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePayrollDto {
  @IsMongoId()
  @IsNotEmpty()
  employeeId!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month!: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(2000)
  @Max(2100)
  @Type(() => Number)
  year!: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  basicSalary!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  bonuses?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  deductions?: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  netSalary!: number;

  @IsString()
  @IsIn(['draft', 'processed', 'paid'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
