// src/common/guards/jwt-local.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtLocalGuard implements CanActivate {
  private readonly allowedRoles = ['HR_USER', 'PROD_USER', 'ADMIN', 'SUPER_ADMIN'];

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    try {
      const payload: any = jwt.verify(
        token,
        process.env.JWT_SECRET || 'devsecret'
      );

      // Vérifie que le rôle est autorisé
      if (!this.allowedRoles.includes(payload.role)) {
        throw new UnauthorizedException('Role not allowed');
      }

      // Attache l’info user à la requête
      req.user = { userId: payload.userId, role: payload.role };
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}