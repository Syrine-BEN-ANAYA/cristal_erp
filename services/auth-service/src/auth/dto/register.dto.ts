import { IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { UserRole } from '../../users/schemas/user.schema';

export class RegisterDto {
  @IsNotEmpty()
  username!: string;

  @MinLength(8)
  password!: string;

  @IsEnum(UserRole, { message: 'Le rôle doit être USER, MANAGER ou ADMIN' })
  @IsNotEmpty({ message: 'Le rôle est obligatoire' })
  role!: UserRole; // ✅ obligatoire maintenant
}