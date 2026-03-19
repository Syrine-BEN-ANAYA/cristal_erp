import {  IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class UpdateUserDto {
  @IsOptional()
  @IsNotEmpty()
  username?: string;


  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}