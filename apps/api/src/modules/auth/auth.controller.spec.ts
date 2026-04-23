import { Test } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

describe('AuthController', () => {
  it('delegates to AuthService and returns the fixed response shape', async () => {
    const requestMagicLink = jest.fn().mockResolvedValue(undefined)
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: { requestMagicLink } }],
    }).compile()

    const controller = moduleRef.get(AuthController)
    const body = { email: 'sophie@biosensio.fr' } as unknown as Parameters<
      AuthController['requestMagicLink']
    >[0]
    const result = await controller.requestMagicLink(body)

    expect(requestMagicLink).toHaveBeenCalledWith('sophie@biosensio.fr')
    expect(result).toEqual({ message: 'Magic link sent.' })
  })
})
