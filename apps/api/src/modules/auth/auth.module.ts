import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { EMAIL_TRANSPORT } from './email/email-transport'
import { NodemailerTransport } from './email/nodemailer.transport'

@Module({
  controllers: [AuthController],
  providers: [AuthService, { provide: EMAIL_TRANSPORT, useClass: NodemailerTransport }],
  exports: [AuthService],
})
export class AuthModule {}
