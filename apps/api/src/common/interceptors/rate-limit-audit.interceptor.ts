import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, catchError, throwError } from 'rxjs'
import { ThrottlerException } from '@nestjs/throttler'
import type { Request } from 'express'
import { AuditService } from '../../modules/audit/audit.service'

@Injectable()
export class RateLimitAuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((err: unknown) => {
        if (err instanceof ThrottlerException) {
          const req = context.switchToHttp().getRequest<Request>()
          void this.audit.record({
            actionType: 'rate_limit_exceeded',
            metadata: {
              path: req.url,
              method: req.method,
              ip: req.ip ?? null,
              userAgent: req.headers['user-agent'] ?? null,
            },
          })
        }
        return throwError(() => err)
      }),
    )
  }
}
