import { IsNotEmpty, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;


  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole, { message: 'Le rôle doit être USER, MANAGER ou ADMIN' })
  @IsNotEmpty({ message: 'Le rôle est obligatoire' })
  role: UserRole; // ✅ obligatoire maintenant
}