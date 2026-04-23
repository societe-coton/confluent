import { Module } from '@nestjs/common'
import { AdminDossiersController } from './admin-dossiers.controller'
import { AdminDossiersService } from './admin-dossiers.service'
import { AnswersModule } from '../answers/answers.module'
import { DossiersModule } from '../dossiers/dossiers.module'

@Module({
  imports: [AnswersModule, DossiersModule],
  controllers: [AdminDossiersController],
  providers: [AdminDossiersService],
  exports: [AdminDossiersService],
})
export class AdminModule {}
