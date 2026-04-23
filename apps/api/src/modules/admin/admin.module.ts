import { Module } from '@nestjs/common'
import { AdminDossiersController } from './admin-dossiers.controller'
import { AdminDossiersService } from './admin-dossiers.service'
import { AdminQuestionnaireController } from './admin-questionnaire.controller'
import { AdminUsersController } from './admin-users.controller'
import { AdminUsersService } from './admin-users.service'
import { AdminAnalyticsController } from './admin-analytics.controller'
import { AdminAnalyticsService } from './admin-analytics.service'
import { AdminSharesController } from './admin-shares.controller'
import { AdminSharesService } from './admin-shares.service'
import { AnswersModule } from '../answers/answers.module'
import { DossiersModule } from '../dossiers/dossiers.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AnswersModule, DossiersModule, AuthModule],
  controllers: [
    AdminDossiersController,
    AdminQuestionnaireController,
    AdminUsersController,
    AdminAnalyticsController,
    AdminSharesController,
  ],
  providers: [AdminDossiersService, AdminUsersService, AdminAnalyticsService, AdminSharesService],
  exports: [AdminDossiersService, AdminUsersService, AdminAnalyticsService, AdminSharesService],
})
export class AdminModule {}
