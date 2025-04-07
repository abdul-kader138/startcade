// test/unit/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '../../../src/mailer/mailer.service';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return {
    ...actual,
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
      userProvider: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    })),
  };
});

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: JwtService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    mailerService = module.get<MailerService>(MailerService);
    prisma = (service as any).constructor.prototype.prisma;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should throw if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      await expect(service.validateUser('test@example.com', '1234')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password does not match', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ email: 'test@example.com', password: 'hashed', is_verified: true });
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
      await expect(service.validateUser('test@example.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });

    it('should return user if valid', async () => {
      const mockUser = { email: 'test@example.com', password: bcrypt.hashSync('1234', 10), is_verified: true, photo: {} };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      const result = await service.validateUser('test@example.com', '1234');
      expect(result).toEqual(mockUser);
    });
  });

  describe('register', () => {
    it('should throw if email already exists', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({});
      await expect(service.register({ email: 'exists@example.com', password: '1234', first_name: 'John', last_name: 'Doe' })).rejects.toThrow();
    });

    it('should register and send email', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue({ id: 1, email: 'new@example.com', first_name: 'Jane', last_name: 'Doe' });
      const result = await service.register({ email: 'new@example.com', password: '1234', first_name: 'Jane', last_name: 'Doe' });
      expect(result.user.email).toEqual('new@example.com');
    });
  });

  describe('verifyEmail', () => {
    it('should throw if token is invalid', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      await expect(service.verifyEmail('badtoken')).rejects.toThrow(UnauthorizedException);
    });

    it('should update user if token is valid', async () => {
      const mockUser = { id: 1, verification_token: 'validtoken' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({});
      const result = await service.verifyEmail('validtoken');
      expect(result.message).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should clear JWT cookie', async () => {
      const res = { clearCookie: jest.fn(), json: jest.fn() } as any;
      await service.logout(res);
      expect(res.clearCookie).toHaveBeenCalledWith('jwt');
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('editUser', () => {
    it('should throw if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      await expect(service.editUser({ email: 'none@example.com' } as any)).rejects.toThrow(NotFoundException);
    });

    it('should update user if found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ email: 'test@example.com' });
      jest.spyOn(prisma.user, 'update').mockResolvedValue({});
      await expect(service.editUser({ email: 'test@example.com' } as any)).resolves.toBeDefined();
    });
  });

  describe('forgotPassword', () => {
    it('should throw if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      await expect(service.forgotPassword('bad@example.com')).rejects.toThrow();
    });

    it('should send reset email if user exists', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ email: 'test@example.com' });
      jest.spyOn(prisma.user, 'update').mockResolvedValue({ reset_password_token: 'token' });
      const result = await service.forgotPassword('test@example.com');
      expect(result.message).toBeDefined();
    });
  });

  describe('resetPassword', () => {
    it('should throw if token is invalid or expired', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      await expect(service.resetPassword('badtoken', 'newpass')).rejects.toThrow();
    });

    it('should update password if token is valid', async () => {
      const user = { id: 1 };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(user);
      const result = await service.resetPassword('validtoken', 'newpass');
      expect(result.message).toBeDefined();
    });
  });

  describe('OAuthLogin', () => {
    it('should create new user if none exists', async () => {
      jest.spyOn(prisma.userProvider, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue({ id: 1, email: 'steam@example.com' });
      const res = { cookie: jest.fn() } as any;
      await service.OAuthLogin({ id: '123', username: 'steamuser' }, 'steam', res);
      expect(res.cookie).toHaveBeenCalled();
    });
  });
});
