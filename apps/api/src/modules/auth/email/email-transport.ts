export const EMAIL_TRANSPORT = Symbol('EMAIL_TRANSPORT')

export type Locale = 'fr'

export interface SendMagicLinkInput {
  to: string
  magicLinkUrl: string
  locale: Locale
}

export interface SendShareInviteInput {
  to: string
  dossierName: string
  shareUrl: string
  locale: Locale
}

export interface EmailTransport {
  sendMagicLink(input: SendMagicLinkInput): Promise<void>
  sendShareInvite(input: SendShareInviteInput): Promise<void>
}
