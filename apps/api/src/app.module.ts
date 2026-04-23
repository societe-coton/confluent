import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { validateConfig } from './config/config.schema'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { AuditModule } from './modules/audit/audit.module'
import { ShareLinksModule } from './modules/share-links/share-links.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    ShareLinksModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
