import { Controller, Post, Body, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/schemas/user.schema';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService, // injection nécessaire pour register
  ) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.username, body.password);
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: any) {
    // 1️⃣ Vérifie que le rôle est fourni
    if (!dto.role) {
      throw new BadRequestException('Le rôle est obligatoire');
    }

    // 2️⃣ Détermine le rôle que le créateur peut assigner
    const requesterRole = req.user?.role || UserRole.SUPER_ADMIN; // SYSTEM si SUPER_ADMIN auto
    let roleToAssign: UserRole = dto.role;

    if (requesterRole === UserRole.ADMIN) {
      if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(dto.role)) {
        throw new BadRequestException('Un ADMIN ne peut créer que des USER ou MANAGER');
      }
    } else if (requesterRole === UserRole.USER) {
      if (dto.role !== UserRole.USER) {
        throw new BadRequestException('Vous ne pouvez pas créer ce rôle');
      }
    }
    // SUPER_ADMIN peut créer tout rôle

    // 3️⃣ Création effective
    const user = await this.usersService.create(
      { ...dto, role: roleToAssign },
      req.user || { _id: 'SYSTEM', role: UserRole.SUPER_ADMIN },
    );

    return {
      message: 'Utilisateur créé avec succès',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    };
  }
}