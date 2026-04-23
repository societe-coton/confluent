import { Module } from '@nestjs/common'
import { AdminDossiersController } from './admin-dossiers.controller'
import { AdminDossiersService } from './admin-dossiers.service'
import { AdminQuestionnaireController } from './admin-questionnaire.controller'
import { AdminUsersController } from './admin-users.controller'
import { AdminUsersService } from './admin-users.service'
import { AnswersModule } from '../answers/answers.module'
import { DossiersModule } from '../dossiers/dossiers.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AnswersModule, DossiersModule, AuthModule],
  controllers: [AdminDossiersController, AdminQuestionnaireController, AdminUsersController],
  providers: [AdminDossiersService, AdminUsersService],
  exports: [AdminDossiersService, AdminUsersService],
})
export class AdminModule {}
