import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { validateConfig } from './config/config.schema'
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
