import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import Lang from '../lang/lang';
import { Helper } from '../utils/helper';
import { MailerService } from '../mailer/mailer.service';

const prisma = new PrismaClient();
@Injectable()
export class NewsletterService {
  constructor(private readonly mailerService: MailerService) {}

  private helper = new Helper();


  async subscribe(email: string) {
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });

    if (existing && existing.is_confirmed) {
      throw new ConflictException(Lang.subscription_exist_message);
    }
    const token=crypto.randomBytes(32).toString('hex');

    const subscribed = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { token, is_confirmed: false },
      create: { email, token },
    });

    if (!subscribed) {
      throw new ConflictException(Lang.unknown_error);
    }
    const url = `${process.env.NX_API_BASE_URL}/newsletter/confirm/${token}`;
    await this.mailerService.sendMail(email,  Lang.confirm_your_subscription,
       this.helper.subscription_email_body(url));
    return { message:  Lang.subscription_email_sent_message};
  }

  async confirmSubscription(token: string) {
    const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { token } });

    if (!subscriber) {
      throw new ConflictException(Lang.invalid_token);
    }

    return prisma.newsletterSubscriber.update({
      where: { token },
      data: {
        is_confirmed: true,
        confirmed_at: new Date(),
        token: null,
      },
    });
  }

}
