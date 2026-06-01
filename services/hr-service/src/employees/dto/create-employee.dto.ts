import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsIn(['male', 'female'])
  @IsOptional()
  gender?: string;

  @IsMongoId()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsNotEmpty()
  position!: string;

  @IsDateString()
  @IsOptional()
  hireDate?: string;

  @IsArray()
  @IsOptional()
  skills?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsEnum(['none', 'requested', 'created'])
  @IsOptional()
  accountStatus?: 'none' | 'requested' | 'created';
}
