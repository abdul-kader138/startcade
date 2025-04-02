// src/mailer/mailer.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);


  async sendMail(to: string, subject: string, html: string) {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      this.logger.log(`✅ Email Sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`❌ Email Failed: ${error.message}`);
    }
  }
}
