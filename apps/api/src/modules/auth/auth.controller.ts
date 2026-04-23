import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { magicLinkRequestSchema, type MagicLinkRequest } from '@confluent/shared'
import { createZodDto } from 'nestjs-zod'
import { AuthService } from './auth.service'

class MagicLinkRequestDto extends createZodDto(magicLinkRequestSchema) {}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('magic-link')
  @HttpCode(200)
  async requestMagicLink(@Body() body: MagicLinkRequestDto): Promise<{ message: string }> {
    const { email }: MagicLinkRequest = body
    await this.auth.requestMagicLink(email)
    return { message: 'Magic link sent.' }
  }
}
