import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { APP_GUARD } from '@nestjs/core'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { EMAIL_TRANSPORT } from './email/email-transport'
import { NodemailerTransport } from './email/nodemailer.transport'
import { JwtStrategy } from './strategies/jwt.strategy'
import { JwtAuthGuard } from './guards/jwt.guard'

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    NodemailerTransport,
    { provide: EMAIL_TRANSPORT, useExisting: NodemailerTransport },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [AuthService, JwtModule, PassportModule, EMAIL_TRANSPORT],
})
export class AuthModule {}
