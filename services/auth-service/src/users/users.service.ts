import { Injectable, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private auditService: AuditService,
  ) {}

  // ==========================================
  // Créer un utilisateur
  // ==========================================
  async create(dto: CreateUserDto, requester: any) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new BadRequestException('Cet email est déjà utilisé');

    let password = dto.password;
    let mustChangePassword = false;

    // Mot de passe temporaire pour USER ou MANAGER
    if (dto.role === UserRole.USER) {
      mustChangePassword = true;
      if (!password) {
        password = Math.random().toString(36).slice(-8) + 'A1!';
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      mustChangePassword,
    });

    const user = await newUser.save();

    await this.auditService.log({
      userId: requester._id?.toString() || 'SYSTEM',
      action: 'CREATE_USER',
      entity: 'USER',
    });

    const { password: _, ...result } = user.toObject();
    return result;
  }

  // ==========================================
  // Récupérer tous les utilisateurs selon rôle
  // ==========================================
  async findAll(requester: any) {
    if (requester.role === UserRole.SUPER_ADMIN) return this.userModel.find();
    if (requester.role === UserRole.ADMIN) return this.userModel.find({
      role: { $nin: [UserRole.ADMIN, UserRole.SUPER_ADMIN] }
    });
    throw new ForbiddenException('Non autorisé');
  }

  // ==========================================
  // Récupérer un utilisateur par ID
  // ==========================================
  async findOne(id: string, requester: any) {
    const user = await this.userModel.findById(id);
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    if (requester.role === UserRole.ADMIN && [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      throw new ForbiddenException('Non autorisé');
    }

    const { password, ...result } = user.toObject();
    return result;
  }

  // ==========================================
  // Mettre à jour un utilisateur
  // ==========================================
  async update(id: string, dto: UpdateUserDto, requester: any) {
    const user = await this.userModel.findById(id);
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    if (requester.role === UserRole.ADMIN && [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      throw new ForbiddenException('Non autorisé');
    }

    Object.assign(user, dto);
    await user.save();

    await this.auditService.log({
      userId: requester._id.toString(),
      action: 'UPDATE_USER',
      entity: 'USER',
    });

    const { password, ...result } = user.toObject();
    return result;
  }

  // ==========================================
  // Supprimer un utilisateur
  // ==========================================
  async deleteUser(id: string, requester: any) {
    const user = await this.userModel.findById(id);
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    if (requester.role === UserRole.ADMIN && [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      throw new ForbiddenException('Non autorisé');
    }

await user.deleteOne();
    await this.auditService.log({
      userId: requester._id.toString(),
      action: 'DELETE_USER',
      entity: 'USER',
    });

    return { message: 'Utilisateur supprimé avec succès' };
  }

  // ==========================================
  // Changer le mot de passe
  // ==========================================
  async changePassword(id: string, dto: ChangePasswordDto, requester: any) {
    const user = await this.userModel.findById(id);
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    if (requester.role === UserRole.USER && requester._id.toString() !== id) {
      throw new ForbiddenException('Non autorisé');
    }

    user.password = await bcrypt.hash(dto.newPassword, 12);
    user.mustChangePassword = false;
    await user.save();

    await this.auditService.log({
      userId: requester._id.toString(),
      action: 'CHANGE_PASSWORD',
      entity: 'USER',
    });

    const { password, ...result } = user.toObject();
    return result;
  }

  // ==========================================
  // Forcer le changement de mot de passe (optionnel)
  // ==========================================
  async forceChangePassword(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    user.mustChangePassword = true;
    await user.save();
  }
}