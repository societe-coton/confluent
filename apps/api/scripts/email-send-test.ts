import 'dotenv/config'
import { createConnection } from 'node:net'
import { ConfigService } from '@nestjs/config'
import { NodemailerTransport } from '../src/modules/auth/email/nodemailer.transport'
import type { AppConfig } from '../src/config/config.schema'

const TO = process.env.EMAIL_TEST_TO ?? 'test@confluent.local'

interface RawEnv {
  SMTP_HOST: string
  SMTP_PORT: string | number
  SMTP_USER: string
  SMTP_PASSWORD: string
  SMTP_FROM: string
}

function mustEnv(key: keyof RawEnv): string {
  const v = process.env[key]
  if (v === undefined || v === '') {
    if (key === 'SMTP_USER' || key === 'SMTP_PASSWORD') return ''
    throw new Error(`Missing required env var: ${key}`)
  }
  return v
}

function smtpProbe(host: string, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host, port, timeout: 2000 })
    socket.once('connect', () => {
      socket.end()
      resolve()
    })
    socket.once('timeout', () => {
      socket.destroy()
      reject(new Error(`SMTP timeout on ${host}:${port}`))
    })
    socket.once('error', (err) => reject(err))
  })
}

async function main(): Promise<void> {
  /* eslint-disable no-console */
  const host = mustEnv('SMTP_HOST')
  const port = Number(mustEnv('SMTP_PORT'))
  const from = mustEnv('SMTP_FROM')

  console.log(`Probing SMTP ${host}:${port}…`)
  try {
    await smtpProbe(host, port)
  } catch (err) {
    console.error(`✗ Cannot reach SMTP at ${host}:${port}: ${err instanceof Error ? err.message : String(err)}`)
    console.error(`\n  Start Mailhog locally:`)
    console.error(`    docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog`)
    console.error(`  or maildev:`)
    console.error(`    pnpm dlx maildev -s 1025 -w 8025`)
    process.exit(1)
  }
  console.log(`✓ SMTP reachable.`)

  const cfg = {
    get: (k: keyof AppConfig) => {
      switch (k) {
        case 'SMTP_HOST':
          return host
        case 'SMTP_PORT':
          return port
        case 'SMTP_USER':
          return process.env.SMTP_USER ?? ''
        case 'SMTP_PASSWORD':
          return process.env.SMTP_PASSWORD ?? ''
        case 'SMTP_FROM':
          return from
        default:
          return process.env[k as string] ?? ''
      }
    },
  } as unknown as ConfigService<AppConfig, true>

  const transport = new NodemailerTransport(cfg)

  console.log(`\nSending magic-link to ${TO}…`)
  await transport.sendMagicLink({
    to: TO,
    magicLinkUrl: 'https://confluent.local/auth/verify?token=00000000-0000-0000-0000-000000000000',
    locale: 'fr',
  })
  console.log(`✓ Magic-link sent.`)

  console.log(`Sending share-invite to ${TO}…`)
  await transport.sendShareInvite({
    to: TO,
    dossierName: 'Biosensio · Pre-seed 2026',
    shareUrl: 'https://confluent.local/share/00000000-0000-0000-0000-000000000000',
    locale: 'fr',
  })
  console.log(`✓ Share-invite sent.`)

  console.log(`\nMailhog UI : http://localhost:8025`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack ?? err.message : String(err))
  process.exit(1)
})
