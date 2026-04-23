import { Module } from '@nestjs/common'
import { DocumentsController } from './documents.controller'
import { DocumentsService } from './documents.service'
import { DossiersModule } from '../dossiers/dossiers.module'
import { STORAGE_TOKEN } from './storage/storage.adapter'
import { MemoryStorageAdapter } from './storage/memory-storage.adapter'

@Module({
  imports: [DossiersModule],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    MemoryStorageAdapter,
    { provide: STORAGE_TOKEN, useExisting: MemoryStorageAdapter },
  ],
  exports: [DocumentsService],
})
export class DocumentsModule {}
