// test/unit/mailer.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '../../../src/mailer/mailer.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer'); // 👈 Fully mock nodemailer

describe('MailerService', () => {
  let service: MailerService;
  let sendMailMock: jest.Mock;

  beforeEach(async () => {
    // Setup mock for sendMail
    sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });

    // Setup mock for createTransport to return an object with sendMail
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [MailerService],
    }).compile();

    service = module.get<MailerService>(MailerService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Reset between tests
  });

  // ===================== SEND SUCCESS =====================
  it('should send an email successfully and log message ID', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await service.sendMail('test@example.com', 'Test Subject', '<p>Hello</p>');

    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalledWith({
      from: process.env.EMAIL_USER,
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<p>Hello</p>',
    });
  });

  // ===================== SEND FAILURE =====================
  it('should log an error if sendMail fails', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('Send failed'));

    const loggerError = jest.spyOn(service['logger'], 'error').mockImplementation();

    await service.sendMail('fail@example.com', 'Fail Subject', '<p>Oops</p>');

    expect(loggerError).toHaveBeenCalledWith('❌ Email Failed: Send failed');
  });
});
