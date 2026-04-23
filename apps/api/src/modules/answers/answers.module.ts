import { Module } from '@nestjs/common'
import { AnswersController } from './answers.controller'
import { AnswersService } from './answers.service'
import { DossiersModule } from '../dossiers/dossiers.module'

@Module({
  imports: [DossiersModule],
  controllers: [AnswersController],
  providers: [AnswersService],
  exports: [AnswersService],
})
export class AnswersModule {}
