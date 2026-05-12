// CLI — issue a JWT access token for an existing user.
// Works wherever JWT_SECRET + DATABASE_URL are exposed (dev local, CI, preprod).
// NOT deployed to prod runtime; lives in scripts/, excluded from the Docker image.
//
// Contract:
//   stdout     = raw token only
//   stderr     = human context
//   exit 0     = success
//   exit 1     = user not found (invalid argument)
//   exit 2     = config invalid (JWT_SECRET missing / too short)
//   exit 3     = user inactive (JWT issuance refused by policy)

import { PrismaClient } from '@prisma/client'
import { config as loadEnv } from 'dotenv'
import jwt from 'jsonwebtoken'

async function main(): Promise<void> {
  loadEnv({ path: '.env', quiet: true })
  loadEnv({ path: '.env.local', override: false, quiet: true })

  const ACCESS_TOKEN_TTL_SECONDS = 15 * 60

  const email = process.argv[2]?.trim().toLowerCase()
  if (!email) {
    console.error('Usage: pnpm api:token <email>')
    console.error('Example: pnpm api:token sophie@confluent.dev')
    process.exit(1)
  }

  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    console.error('JWT_SECRET missing or too short (min 32 chars) in env')
    process.exit(2)
  }

  const prisma = new PrismaClient()
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      console.error(`No user found for ${email}. Run \`pnpm db:seed\` first.`)
      process.exit(1)
    }
    if (!user.isActive) {
      console.error(`User ${email} is inactive. JWT issuance refused.`)
      process.exit(3)
    }
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
    )
    console.error(`# JWT for ${user.email} (${user.role}) — valid 15 min`)
    console.log(token)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
