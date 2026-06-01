import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';

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
  // CREATE USER FROM EMPLOYEE (MAIN FLOW)
  // ==========================================
  async createFromEmployee(employee: any, dto: CreateUserDto, requester: any) {
    // Validation ID employee
    if (!employee._id?.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('Invalid employee ID format');
    }

    // Récupération employé via HR service
    const { data: fullEmployee } = await axios.get(
      `${process.env.HR_SERVICE_URL || 'http://localhost:3106'}/employees/${employee._id}`,
    );

    const status = fullEmployee.accountStatus?.trim();
    if (status !== 'requested') {
      throw new BadRequestException(
        `Employee must be in requested state (current: ${status})`,
      );
    }

    // Vérifications d'unicité
    const existing = await this.userModel.findOne({ username: dto.username });
    if (existing) throw new BadRequestException('Username already exists');

    const alreadyLinked = await this.userModel.findOne({
      employeeId: fullEmployee._id,
    });
    if (alreadyLinked) {
      throw new BadRequestException('User already exists for this employee');
    }

    // Vérification des droits du requester pour assigner le rôle
    const allowedRoles = this.getAllowedRolesForRequester(requester);
    if (!allowedRoles.includes(dto.role)) {
      throw new ForbiddenException(`You cannot assign role ${dto.role}`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await new this.userModel({
      username: dto.username,
      password: hashedPassword,
      role: dto.role,
      mustChangePassword: true,
      employeeId: fullEmployee._id,
    }).save();

    // Mise à jour du statut dans HR (best effort)
    try {
      await axios.put(
        `${process.env.HR_SERVICE_URL || 'http://localhost:3106'}/employees/${fullEmployee._id}`,
        { accountStatus: 'created' },
      );
    } catch (error) {
      console.error('HR update failed:', (error as any)?.message);
    }

    await this.auditService.log({
      userId: requester._id?.toString() || 'SYSTEM',
      action: 'CREATE_USER_FROM_EMPLOYEE',
      entity: 'USER',
    });

    const { password, ...result } = user.toObject();
    return result;
  }

  // ==========================================
  // CREATE NORMAL USER
  // ==========================================
  async create(dto: CreateUserDto, requester: any) {
    // Vérification des droits
    const allowedRoles = this.getAllowedRolesForRequester(requester);
    if (!allowedRoles.includes(dto.role)) {
      throw new ForbiddenException(`You cannot assign role ${dto.role}`);
    }

    const existing = await this.userModel.findOne({ username: dto.username });
    if (existing) throw new BadRequestException('Ce username est déjà utilisé');

    let password = dto.password;
    let mustChangePassword = false;

    if (dto.role === UserRole.PROD_USER || dto.role === UserRole.HR_USER) {
      mustChangePassword = true;
      if (!password) {
        password = Math.random().toString(36).slice(-8) + 'A1!';
      }
    } else if (dto.role === UserRole.ADMIN || dto.role === UserRole.SUPER_ADMIN) {
      if (!password) {
        throw new BadRequestException('Password is required for admin roles');
      }
      mustChangePassword = true;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await new this.userModel({
      username: dto.username,
      password: hashedPassword,
      role: dto.role,
      mustChangePassword,
    }).save();

    await this.auditService.log({
      userId: requester._id?.toString() || 'SYSTEM',
      action: 'CREATE_USER',
      entity: 'USER',
    });

    const { password: _, ...result } = user.toObject();
    return result;
  }

  // ==========================================
  // FIND ALL USERS (filtrage selon rôle)
  // ==========================================
  async findAll(requester: any) {
    if (requester.role === UserRole.SUPER_ADMIN) {
      return this.userModel.find().select('-password');
    }
    if (requester.role === UserRole.ADMIN) {
      // Admin ne voit ni SUPER_ADMIN ni les autres ADMIN
      return this.userModel.find({
        role: { $nin: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
      }).select('-password');
    }
    throw new ForbiddenException('Non autorisé');
  }

  // ==========================================
  // FIND ONE USER
  // ==========================================
  async findOne(id: string, requester: any) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('Invalid user ID format');
    }
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    if (!this.canAccessUser(requester, user)) {
      throw new ForbiddenException('Non autorisé');
    }
    return user;
  }

  // ==========================================
  // UPDATE USER
  // ==========================================
  async update(id: string, dto: UpdateUserDto, requester: any) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('Invalid user ID format');
    }
    const user = await this.userModel.findById(id);
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    if (!this.canModifyUser(requester, user)) {
      throw new ForbiddenException('You cannot modify this user');
    }

    if (dto.role && dto.role !== user.role) {
      const allowedRoles = this.getAllowedRolesForRequester(requester);
      if (!allowedRoles.includes(dto.role)) {
        throw new ForbiddenException(`You cannot assign role ${dto.role}`);
      }
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
  // DELETE USER
  // ==========================================
  async deleteUser(id: string, requester: any) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('Invalid user ID format');
    }
    const user = await this.userModel.findById(id);
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    if (!this.canModifyUser(requester, user)) {
      throw new ForbiddenException('You cannot delete this user');
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
  // CHANGE PASSWORD
  // ==========================================
  async changePassword(id: string, dto: ChangePasswordDto, requester: any) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('Invalid user ID format');
    }
    const user = await this.userModel.findById(id);
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    const isSelf = requester._id.toString() === id;
    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(requester.role);
    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('You can only change your own password');
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
  // FORCE PASSWORD RESET
  // ==========================================
  async forceChangePassword(userId: string) {
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('Invalid user ID format');
    }
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');
    user.mustChangePassword = true;
    await user.save();
  }

  // ========== HELPERS ==========
  private getAllowedRolesForRequester(requester: any): UserRole[] {
    switch (requester.role) {
      case UserRole.SUPER_ADMIN:
        return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROD_USER, UserRole.HR_USER];
      case UserRole.ADMIN:
        return [UserRole.PROD_USER, UserRole.HR_USER];
      default:
        return [];
    }
  }

  private canAccessUser(requester: any, targetUser: any): boolean {
    if (requester.role === UserRole.SUPER_ADMIN) return true;
    if (requester.role === UserRole.ADMIN) {
      return ![UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(targetUser.role);
    }
    return false;
  }

  private canModifyUser(requester: any, targetUser: any): boolean {
    if (targetUser.role === UserRole.SUPER_ADMIN) {
      return requester.role === UserRole.SUPER_ADMIN;
    }
    if (requester.role === UserRole.SUPER_ADMIN) return true;
    if (requester.role === UserRole.ADMIN) {
      return [UserRole.PROD_USER, UserRole.HR_USER].includes(targetUser.role);
    }
    return false;
  }
}