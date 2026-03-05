import { IsEnum, IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { UserRole } from '../../users/schemas/user.schema';

export class RegisterDto {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsEnum(UserRole, { message: 'Le rôle doit être USER, MANAGER ou ADMIN' })
  @IsNotEmpty({ message: 'Le rôle est obligatoire' })
  role: UserRole; // ✅ obligatoire maintenant
}