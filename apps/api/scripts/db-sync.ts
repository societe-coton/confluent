// Dev convenience — `prisma migrate deploy` (prod-safe) + optional idempotent seed via --seed.
// Prod path goes through the dedicated `api-migrate` service in docker-compose.prod.yml
// and never calls this script.

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const withSeed = process.argv.includes('--seed')
const apiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function run(cmd: string, args: string[]): void {
  console.log(`\n$ ${cmd} ${args.join(' ')}`)
  const result = spawnSync(cmd, args, { cwd: apiDir, stdio: 'inherit', shell: true })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

run('pnpm', ['db:migrate:deploy'])
if (withSeed) run('pnpm', ['db:seed'])
