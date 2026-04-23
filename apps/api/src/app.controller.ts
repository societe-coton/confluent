import { Controller, Get } from '@nestjs/common'

interface HealthResponse {
  status: 'ok'
  service: 'confluent-api'
  version: string
}

@Controller()
export class AppController {
  @Get()
  getHealth(): HealthResponse {
    return { status: 'ok', service: 'confluent-api', version: '0.0.1' }
  }
}
