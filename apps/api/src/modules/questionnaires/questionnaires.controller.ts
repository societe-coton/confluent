import { Controller, Get } from '@nestjs/common'
import { Public } from '../../common/decorators/public.decorator'
import { QuestionnairesService, type ActiveQuestionnaire } from './questionnaires.service'

@Controller('questionnaires')
export class QuestionnairesController {
  constructor(private readonly service: QuestionnairesService) {}

  @Public()
  @Get('active')
  getActive(): Promise<ActiveQuestionnaire> {
    return this.service.getActive()
  }
}
