import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import type { Request } from 'express'
import type { AuthenticatedUser } from '../strategies/jwt.strategy'

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>()
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Admin role required.' })
    }
    return true
  }
}
