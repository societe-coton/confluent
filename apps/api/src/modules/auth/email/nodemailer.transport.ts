import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createTransport, type Transporter } from 'nodemailer'
import type { AppConfig } from '../../../config/config.schema'
import type { EmailTransport, MailPayload } from './email-transport'

@Injectable()
export class NodemailerTransport implements EmailTransport {
  private readonly logger = new Logger(NodemailerTransport.name)
  private readonly transporter: Transporter

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    const host = this.config.get('SMTP_HOST', { infer: true })
    const port = this.config.get('SMTP_PORT', { infer: true })
    const user = this.config.get('SMTP_USER', { infer: true })
    const pass = this.config.get('SMTP_PASSWORD', { infer: true })
    this.transporter = createTransport({
      host,
      port,
      secure: false,
      auth: user ? { user, pass } : undefined,
    })
  }

  async sendMail(payload: MailPayload): Promise<void> {
    try {
      await this.transporter.sendMail(payload)
    } catch (err) {
      this.logger.warn(
        `Failed to send email to ${payload.to}: ${err instanceof Error ? err.message : String(err)}`,
      )
      throw err
    }
  }
}
