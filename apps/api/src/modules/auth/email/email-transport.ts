export const EMAIL_TRANSPORT = Symbol('EMAIL_TRANSPORT')

export interface MailPayload {
  to: string
  subject: string
  text: string
  html: string
  from: string
}

export interface EmailTransport {
  sendMail(payload: MailPayload): Promise<void>
}
