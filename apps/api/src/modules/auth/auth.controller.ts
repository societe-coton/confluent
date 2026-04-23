import { Body, Controller, Get, HttpCode, Post, Query, Req, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request, Response } from 'express'
import { magicLinkRequestSchema, type MagicLinkRequest } from '@confluent/shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import type { AppConfig } from '../../config/config.schema'
import { Public } from '../../common/decorators/public.decorator'
import { AuthService, type IssuedSession } from './auth.service'
import { REFRESH_COOKIE_NAME, REFRESH_TOKEN_TTL_SECONDS } from './auth.constants'

class MagicLinkRequestDto extends createZodDto(magicLinkRequestSchema) {}
class VerifyQueryDto extends createZodDto(z.object({ token: z.string().uuid() })) {}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Public()
  @Post('magic-link')
  @HttpCode(200)
  async requestMagicLink(@Body() body: MagicLinkRequestDto): Promise<{ message: string }> {
    const { email }: MagicLinkRequest = body
    await this.auth.requestMagicLink(email)
    return { message: 'Magic link sent.' }
  }

  @Public()
  @Get('verify')
  @HttpCode(200)
  async verifyMagicLink(
    @Query() query: VerifyQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; user: IssuedSession['user'] }> {
    const session = await this.auth.verifyMagicLink(query.token)
    this.setRefreshCookie(res, session.refreshToken)
    return { accessToken: session.accessToken, user: session.user }
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; user: IssuedSession['user'] }> {
    const refreshCookie = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined
    const session = await this.auth.refreshSession(refreshCookie)
    this.setRefreshCookie(res, session.refreshToken)
    return { accessToken: session.accessToken, user: session.user }
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response): { message: string } {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/' })
    return { message: 'Logged out.' }
  }

  private setRefreshCookie(res: Response, token: string): void {
    const isProd = this.config.get('NODE_ENV', { infer: true }) === 'production'
    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
    })
  }
}
