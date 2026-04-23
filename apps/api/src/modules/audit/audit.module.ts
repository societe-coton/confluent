import { forwardRef, Global, Module } from '@nestjs/common'
import { AuditService } from './audit.service'
import { AuditLogService } from './audit-log.service'
import { AuditLogController } from './audit-log.controller'
import { DossiersModule } from '../dossiers/dossiers.module'

@Global()
@Module({
  imports: [forwardRef(() => DossiersModule)],
  controllers: [AuditLogController],
  providers: [AuditService, AuditLogService],
  exports: [AuditService, AuditLogService],
})
export class AuditModule {}
