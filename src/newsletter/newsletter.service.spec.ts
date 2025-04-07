import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterService } from './newsletter.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '../mailer/mailer.service';

describe('NewsletterService', () => {
  let service: NewsletterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewsletterService, {
                provide: JwtService,
                useValue: {
                  sign: jest.fn().mockReturnValue('mock-jwt-token'),
                },
              },
              {
                provide: MailerService,
                useValue: {
                  sendMail: jest.fn(),
                },
              },],
    }).compile();

    service = module.get<NewsletterService>(NewsletterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
