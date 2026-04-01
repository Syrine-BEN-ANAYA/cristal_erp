
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from 'src/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true; // bypass pour les routes publiques

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('Authorization header missing');

    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token missing');

    try {
      request.user = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
