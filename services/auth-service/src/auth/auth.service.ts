import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    if (!username || !password)
      throw new UnauthorizedException('Username et mot de passe requis');

    const user = await this.userModel.findOne({ username }).select('+password');
    if (!user || !user.password)
      throw new UnauthorizedException('Username ou mot de passe invalide');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      throw new UnauthorizedException('Username ou mot de passe invalide');

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
  const payload = { sub: user._id, role: user.role, mustChangePassword: user.mustChangePassword };

  await this.auditService.log({
    userId: user._id.toString(),
    action: 'LOGIN',
    entity: 'USER',
  });

  return {
    access_token: this.jwtService.sign(payload),
    user: {
      id: user._id,
      role: user.role,
      mustChangePassword: user.mustChangePassword || false, // ← maintenant dans user
    },
  };
}

  // ✅ Création sécurisée d'un utilisateur
  async createUser(dto: { username: string; password: string; role?: UserRole }, requester: any) {
    if (!dto.username || !dto.password)
      throw new BadRequestException('Username et mot de passe requis');

    // Vérification du rôle selon requester
    let roleToAssign = UserRole.USER; // par défaut
    if (requester.role === UserRole.SUPER_ADMIN) {
      roleToAssign = dto.role || UserRole.USER;
    } else if (requester.role === UserRole.ADMIN) {
      // ADMIN ne peut pas créer SUPER_ADMIN ou ADMIN
      if (dto.role === UserRole.SUPER_ADMIN || dto.role === UserRole.ADMIN) {
        throw new ForbiddenException('Vous ne pouvez pas créer ce rôle');
      }
      roleToAssign = dto.role || UserRole.USER;
    } else {
      throw new ForbiddenException('Vous n\'avez pas la permission de créer des utilisateurs');
    }

    const existing = await this.userModel.findOne({ username: dto.username });
    if (existing)
      throw new BadRequestException('Ce username est déjà utilisé');

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const newUser = new this.userModel({
  username: dto.username, // ← utiliser dto.username
      password: hashedPassword,
      role: roleToAssign,
      mustChangePassword: true, // mot de passe à changer au premier login
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

  async changePassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { password: hashedPassword, mustChangePassword: false },
      { new: true },
    );

    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    await this.auditService.log({
      userId: user._id.toString(),
      action: 'CHANGE_PASSWORD',
      entity: 'USER',
    });

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async changeUsername(userId: string, newUsername: string) {
    const existing = await this.userModel.findOne({ username: newUsername });
    if (existing && existing._id.toString() !== userId)
      throw new BadRequestException('Ce username est déjà utilisé');

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { username: newUsername },
      { new: true },
    );

    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    await this.auditService.log({
      userId: user._id.toString(),
      action: 'CHANGE_USERNAME',
      entity: 'USER',
    });

    const { password: _, ...result } = user.toObject();
    return result;
  }
}