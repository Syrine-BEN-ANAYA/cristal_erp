import { IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { UserRole } from '../../users/schemas/user.schema';

export class RegisterDto {
  @IsNotEmpty()
  username!: string;

  @MinLength(8)
  password!: string;

  @IsEnum(UserRole, { message: 'Role must be PROD_USER,HR_USER, ADMIN or SUPERADMIN' })
  @IsNotEmpty({ message: 'Role is required' })
  role!: UserRole; 
}