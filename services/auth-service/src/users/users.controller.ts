import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Récupère tous les utilisateurs (accessible aux SUPER_ADMIN et ADMIN)
   */
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findAll(@Req() req) {
    return this.usersService.findAll(req.user);
  }

  /**
   * Récupère un utilisateur par son ID (accessible aux SUPER_ADMIN et ADMIN)
   */
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findOne(@Param('id') id: string, @Req() req) {
    return this.usersService.findOne(id, req.user);
  }

  /**
   * Crée un nouvel utilisateur (accessible aux SUPER_ADMIN et ADMIN)
   */
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto, @Req() req) {
    return this.usersService.create(createUserDto, req.user);
  }

  /**
   * Met à jour un utilisateur (accessible aux SUPER_ADMIN et ADMIN)
   */
  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ) {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  /**
   * Supprime un utilisateur (accessible aux SUPER_ADMIN et ADMIN)
   */
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async remove(@Param('id') id: string, @Req() req) {
    return this.usersService.deleteUser(id, req.user);
  }

  /**
   * Change le mot de passe d'un utilisateur.
   * Accessible à :
   * - SUPER_ADMIN et ADMIN pour n'importe quel utilisateur
   * - Un USER pour son propre compte (vérification faite dans le service)
   */
  @Put('change-password/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER)
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
  ) {
    return this.usersService.changePassword(id, changePasswordDto, req.user);
  }

  /**
   * Force un utilisateur à changer son mot de passe à la prochaine connexion.
   * Accessible uniquement aux SUPER_ADMIN et ADMIN.
   */
  @Put('force-change-password/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async forceChangePassword(@Param('id') id: string) {
    return this.usersService.forceChangePassword(id);
  }
}