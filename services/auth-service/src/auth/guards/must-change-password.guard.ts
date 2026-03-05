import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class MustChangePasswordGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    if (user.mustChangePassword) {
      throw new ForbiddenException('Vous devez changer votre mot de passe temporaire.');
    }

    return true;
  }
}