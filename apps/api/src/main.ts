import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ZodValidationPipe } from 'nestjs-zod'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'
import type { AppConfig } from './config/config.schema'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const config = app.get(ConfigService<AppConfig, true>)

  app.set('trust proxy', 1)
  app.use(helmet())
  app.use(cookieParser())
  app.setGlobalPrefix('v1', { exclude: ['/'] })
  app.useGlobalPipes(new ZodValidationPipe())
  app.useGlobalFilters(new GlobalExceptionFilter())
  app.enableCors({ origin: config.get('FRONTEND_URL', { infer: true }), credentials: true })

  const port = config.get('PORT', { infer: true })
  await app.listen(port)
  new Logger('Bootstrap').log(`Application is running on: http://localhost:${port}`)
}

bootstrap().catch((err) => {
  new Logger('Bootstrap').error(
    'Failed to start application',
    err instanceof Error ? err.stack : String(err),
  )
  process.exit(1)
})
