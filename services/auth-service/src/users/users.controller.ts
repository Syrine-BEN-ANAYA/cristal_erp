import { 
  Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ==========================================
  // Récupérer tous les utilisateurs (SUPER_ADMIN / ADMIN)
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get()
  findAll(@Req() req: any) {
    return this.usersService.findAll(req.user);
  }

  // ==========================================
  // Récupérer un utilisateur par ID
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.usersService.findOne(id, req.user);
  }

  // ==========================================
  // Créer un utilisateur
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post()
  async create(@Body() dto: CreateUserDto, @Req() req: any) {
    const user = await this.usersService.create(dto, req.user);

    // Renvoie le mot de passe temporaire uniquement si USER ou MANAGER
    if (user.mustChangePassword) {
      return {
        ...user,
        tempPassword: dto.password, // mot de passe temporaire à communiquer
      };
    }

    return user;
  }

  // ==========================================
  // Mettre à jour un utilisateur
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req: any) {
    return this.usersService.update(id, dto, req.user);
  }

  // ==========================================
  // Supprimer un utilisateur
  // ==========================================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.usersService.deleteUser(id, req.user);
  }

  // ==========================================
  // Changer le mot de passe
  // ==========================================
  @UseGuards(JwtAuthGuard)
  @Put('change-password/:id')
  changePassword(
    @Param('id') id: string, 
    @Body() dto: ChangePasswordDto, 
    @Req() req: any
  ) {
    return this.usersService.changePassword(id, dto, req.user);
  }
}