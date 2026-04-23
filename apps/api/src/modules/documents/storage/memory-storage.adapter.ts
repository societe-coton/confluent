import { Injectable } from '@nestjs/common'
import type { StorageAdapter } from './storage.adapter'

@Injectable()
export class MemoryStorageAdapter implements StorageAdapter {
  private readonly store = new Map<string, { buffer: Buffer; mimetype: string }>()

  upload(key: string, buffer: Buffer, mimetype: string): Promise<void> {
    this.store.set(key, { buffer, mimetype })
    return Promise.resolve()
  }

  getSignedUrl(key: string): Promise<string> {
    const entry = this.store.get(key)
    if (!entry) return Promise.reject(new Error(`Object not found: ${key}`))
    return Promise.resolve(`memory://${key}`)
  }

  delete(key: string): Promise<void> {
    this.store.delete(key)
    return Promise.resolve()
  }
}
