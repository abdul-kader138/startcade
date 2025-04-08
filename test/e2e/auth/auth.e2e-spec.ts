import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '../../../src/mailer/mailer.service';
import { PrismaService } from '../../../prisma/prisma.service'; // Custom Prisma wrapper
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

// Static mock user object for all test scenarios
const mockUserObj = {
  id: 1,
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  password: bcrypt.hashSync('1234', 10),
  verification_token: null,
  is_verified: true,
  about_me: null,
  photo_id: null,
  created_at: new Date(),
  reset_password_token: null,
  reset_password_expires: null,
  photo: {},
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: DeepMockProxy<PrismaService>; // Typed mock of PrismaService

  beforeEach(async () => {
    // Create deep mock of PrismaService manually
    const prismaMock = {
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
    } as unknown as jest.Mocked<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock, // Inject mock PrismaService
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(), // No actual emails sent
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===================== VALIDATE USER =====================
  describe('validateUser', () => {
    it('should throw if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.validateUser('test@example.com', '1234')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password does not match', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUserObj);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
      await expect(service.validateUser(mockUserObj.email, 'wrongpass')).rejects.toThrow(UnauthorizedException);
    });

    it('should return user if valid', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUserObj);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      const result = await service.validateUser(mockUserObj.email, '1234');
      expect(result).toEqual(mockUserObj);
    });
  });

  // ===================== REGISTER USER =====================
  describe('register', () => {
    it('should throw if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUserObj);
      await expect(
        service.register({ email: 'exists@example.com', password: '1234', first_name: 'John', last_name: 'Doe' })
      ).rejects.toThrow();
    });

    it('should register and send email', async () => {
      const newUser = {
        ...mockUserObj,
        id: 2,
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
      };

      // First call: check if user exists (null = not found)
      // Second call: simulate new user retrieval
      prisma.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(newUser);

      prisma.user.create.mockResolvedValue(newUser);

      const result = await service.register({
        email: newUser.email,
        password: '1234',
        first_name: newUser.first_name,
        last_name: newUser.last_name,
      });

      expect(result.user.email).toEqual(newUser.email);
    });
  });

  // ===================== LOGOUT =====================
  describe('logout', () => {
    it('should clear JWT cookie', async () => {
      const res = { clearCookie: jest.fn(), json: jest.fn() } as any;
      await service.logout(res);
      expect(res.clearCookie).toHaveBeenCalledWith('jwt');
      expect(res.json).toHaveBeenCalled();
    });
  });

  // ===================== GET USER BY ID =====================
  describe('getUserById', () => {
    it('should return user by ID', async () => {
      prisma.user.findFirst.mockResolvedValue({ ...mockUserObj });
      const result = await service.getUserById(1);
      expect(result).toEqual(expect.objectContaining({ email: mockUserObj.email }));
    });

    it('should throw if user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.getUserById(99)).rejects.toThrow(NotFoundException);
    });
  });

  // ===================== RESET PASSWORD =====================
  describe('resetPassword', () => {
    it('should throw if token is invalid or expired', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.resetPassword('badtoken', 'newpass')).rejects.toThrow();
    });

    it('should update password if token is valid', async () => {
      const futureDate = new Date(Date.now() + 3600 * 1000); // 1 hour ahead

      const mockResetUser = {
        ...mockUserObj,
        reset_password_token: 'validtoken',
        reset_password_expires: futureDate,
      };

      // Simulate a valid reset token and expiry
      prisma.user.findFirst.mockResolvedValue(mockResetUser);

      // Simulate a successful update
      prisma.user.update.mockResolvedValue({
        ...mockUserObj,
        password: await bcrypt.hash('newpass', 10),
        reset_password_token: null,
        reset_password_expires: null,
      });

      const result = await service.resetPassword('validtoken', 'newpass');
      expect(result.message).toBeDefined(); // Can also be: expect(result.message).toBe(Lang.password_updated_successful_message);
    });
  });

  // ===================== OAUTH LOGIN =====================
  describe('OAuthLogin', () => {
    it('should create new user if none exists', async () => {
      prisma.userProvider.findUnique.mockResolvedValue(null); // Provider not found
      prisma.user.findUnique.mockResolvedValue(null); // User not found
      prisma.user.create.mockResolvedValue(mockUserObj); // Simulate user creation

      const res = { cookie: jest.fn() } as any;

      await service.OAuthLogin({ id: '123', username: 'steamuser' }, 'steam', res);
      expect(res.cookie).toHaveBeenCalledWith('jwt', expect.any(String), expect.any(Object));
    });
  });
});
