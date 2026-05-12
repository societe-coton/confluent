import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from '../../common/decorators/public.decorator'
import { QuestionnairesService, type ActiveQuestionnaire } from './questionnaires.service'

@ApiTags('Questionnaire')
@Controller('questionnaires')
export class QuestionnairesController {
  constructor(private readonly service: QuestionnairesService) {}

  @Public()
  @Get('active')
  @ApiOperation({
    summary: 'Questionnaire actif (publié)',
    description:
      'Publique. Retourne la version publiée courante + la liste des champs ordonnés par ' +
      '`(section, orderIndex)`. Utilisé par le frontend pour construire dynamiquement le formulaire. ' +
      'Bootstrap automatique : si aucune version n’existe, crée la v1 (3 sections / 12 champs baseline).',
  })
  @ApiOkResponse({ description: 'Version active + fields.' })
  getActive(): Promise<ActiveQuestionnaire> {
    return this.service.getActive()
  }
}
