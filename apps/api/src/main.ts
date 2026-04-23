import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)
  const port = Number(process.env.PORT) || 3000
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
