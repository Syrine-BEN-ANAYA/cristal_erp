import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request } from 'express';

interface RequestWithUser extends Request {
  user?: { email?: string; userId?: string };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const method = req.method;
    const url = req.url;
    const user = req.user ? req.user.email || req.user.userId : 'Guest';

    const now = Date.now();
    this.logger.log(`[Request] ${method} ${url} by ${user}`);

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.log(
          `[Response] ${method} ${url} by ${user} → ${responseTime}ms`,
        );
      }),
    );
  }
}
