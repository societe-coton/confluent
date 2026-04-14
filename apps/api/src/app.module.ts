import type { UserRole } from '@confluent/shared'

import { Module } from '@nestjs/common'
import { AppController } from './app.controller'

export type _CrossWorkspaceTypeCheck = UserRole

@Module({
  imports: [],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
