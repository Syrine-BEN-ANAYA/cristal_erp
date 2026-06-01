import { IsNotEmpty, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
  @IsNotEmpty()
  username!: string;


  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsEnum(UserRole, { message: 'Role should be PROD_USER, HR_USER, ADMIN or SUPERADMIN' })
  @IsNotEmpty({ message: 'Role is required' })
  role!: UserRole; 
}