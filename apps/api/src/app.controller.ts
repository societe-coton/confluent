import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from './common/decorators/public.decorator'

interface HealthResponse {
  status: 'ok'
  service: 'confluent-api'
  version: string
}

const APP_VERSION = process.env.APP_VERSION ?? 'dev'

@ApiTags('Santé')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Healthcheck public',
    description:
      'Retourne un statut minimal pour les load balancers / probes. Toujours public, ' +
      'exclu du préfixe global `/v1`. N’interroge ni la DB ni les services externes.',
  })
  @ApiOkResponse({
    description: 'Service UP',
    schema: {
      example: { status: 'ok', service: 'confluent-api', version: '1.0.0' },
    },
  })
  getHealth(): HealthResponse {
    return { status: 'ok', service: 'confluent-api', version: APP_VERSION }
  }
}
