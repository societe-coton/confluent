import { Controller, Get } from '@nestjs/common'
import { Public } from './common/decorators/public.decorator'

interface HealthResponse {
  status: 'ok'
  service: 'confluent-api'
  version: string
}

@Controller()
export class AppController {
  @Public()
  @Get()
  getHealth(): HealthResponse {
    return { status: 'ok', service: 'confluent-api', version: '0.0.1' }
  }
}
