import { PartialType } from '@nestjs/mapped-types';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePayrollDto } from './create-payroll.dto';

export class UpdatePayrollDto extends PartialType(CreatePayrollDto) {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month?: number;

  @IsNumber()
  @IsOptional()
  @Min(2000)
  @Max(2100)
  @Type(() => Number)
  year?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  basicSalary?: number;

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
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  netSalary?: number;

  @IsString()
  @IsIn(['draft', 'processed', 'paid'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
