import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum'; // <-- CORRECT

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
