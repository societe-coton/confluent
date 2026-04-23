export const STORAGE_TOKEN = Symbol('STORAGE_ADAPTER')

export interface StorageAdapter {
  upload(key: string, buffer: Buffer, mimetype: string): Promise<void>
  getSignedUrl(key: string, ttlSeconds?: number): Promise<string>
  delete(key: string): Promise<void>
}
