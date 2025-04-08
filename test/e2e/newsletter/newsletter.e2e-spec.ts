import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterService } from '../../../src/newsletter/newsletter.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { MailerService } from '../../../src/mailer/mailer.service';
import { ConflictException } from '@nestjs/common';
import Lang from '../../../src/lang/lang';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('NewsletterService', () => {
  let service: NewsletterService;
  let mailerService: jest.Mocked<MailerService>;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prisma = mockDeep<PrismaService>();

    const mailerMock = {
      sendMail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsletterService,
        { provide: PrismaService, useValue: prisma },
        { provide: MailerService, useValue: mailerMock },
      ],
    }).compile();

    service = module.get<NewsletterService>(NewsletterService);
    mailerService = module.get(MailerService); // ✅ Correctly retrieve mocked mailer
  });

  // ========== SUBSCRIBE ==========

  describe('subscribe', () => {
    it('should throw if user already subscribed and confirmed', async () => {
      prisma.newsletterSubscriber.findUnique.mockResolvedValue({
        email: 'test@example.com',
        is_confirmed: true,
      } as any);

      await expect(service.subscribe('test@example.com')).rejects.toThrow(
        new ConflictException(Lang.subscription_exist_message)
      );
    });

    it('should create or update subscription and send email', async () => {
      // Simulate new or unconfirmed subscriber
      prisma.newsletterSubscriber.findUnique.mockResolvedValue(null);

      // Simulate upsert success
      prisma.newsletterSubscriber.upsert.mockResolvedValue({
        email: 'test@example.com',
        token: 'sometoken',
        is_confirmed: false,
      } as any);

      const result = await service.subscribe('test@example.com');

      expect(prisma.newsletterSubscriber.upsert).toHaveBeenCalled();
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        'test@example.com',
        Lang.confirm_your_subscription,
        expect.stringContaining('/newsletter/confirm/')
      );
      expect(result.message).toBe(Lang.subscription_email_sent_message);
    });
  });

  // ========== CONFIRM SUBSCRIPTION ==========

  describe('confirmSubscription', () => {
    it('should throw if token is invalid', async () => {
      prisma.newsletterSubscriber.findUnique.mockResolvedValue(null);

      await expect(service.confirmSubscription('badtoken')).rejects.toThrow(
        new ConflictException(Lang.invalid_token)
      );
    });

    it('should confirm subscription with valid token', async () => {
      const now = new Date();

      // Simulate valid token
      prisma.newsletterSubscriber.findUnique.mockResolvedValue({
        email: 'test@example.com',
        token: 'validtoken',
      } as any);

      // Simulate successful update
      prisma.newsletterSubscriber.update.mockResolvedValue({
        email: 'test@example.com',
        is_confirmed: true,
        confirmed_at: now,
        token: null,
      } as any);

      const result = await service.confirmSubscription('validtoken');

      expect(prisma.newsletterSubscriber.update).toHaveBeenCalledWith({
        where: { token: 'validtoken' },
        data: {
          is_confirmed: true,
          confirmed_at: expect.any(Date),
          token: null,
        },
      });

      expect(result.is_confirmed).toBe(true);
      expect(result.token).toBeNull();
    });
  });
});
