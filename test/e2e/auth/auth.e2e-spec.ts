// test/unit/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '../../../src/mailer/mailer.service';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { faker } from '@faker-js/faker';

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

jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return {
    ...actual,
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
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
      };
    }),
  };
});

import { PrismaClient } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    prisma = new PrismaClient();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
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
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    (service as any).prisma = prisma;
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
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUserObj);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
      await expect(service.validateUser(mockUserObj.email, 'wrongpass')).rejects.toThrow(UnauthorizedException);
    });

    it('should return user if valid', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUserObj);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      const result = await service.validateUser(mockUserObj.email, '1234');
      expect(result).toEqual(mockUserObj);
    });
  });

  describe('register', () => {
    it('should throw if email already exists', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUserObj);
      await expect(service.register({ email: 'exists@example.com', password: '1234', first_name: 'John', last_name: 'Doe' })).rejects.toThrow();
    });

    it('should register and send email', async () => {
      const newUser = {
        ...mockUserObj,
        id: 2,
        email: faker.internet.email(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
      };

      jest.spyOn(prisma.user, 'findUnique')
        .mockResolvedValueOnce(null) // check if user exists
        .mockResolvedValueOnce(newUser); // simulate fetching after create

      jest.spyOn(prisma.user, 'create').mockResolvedValue(newUser);

      const result = await service.register({
        email: newUser.email,
        password: '1234',
        first_name: newUser.first_name,
        last_name: newUser.last_name,
      });

      expect(result.user.email).toEqual(newUser.email);
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

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const mockUser = { ...mockUserObj, photo: {} };
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser);
      const result = await service.getUserById(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('resetPassword', () => {
    it('should throw if token is invalid or expired', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
      await expect(service.resetPassword('badtoken', 'newpass')).rejects.toThrow();
    });

    it('should update password if token is valid', async () => {
      const user = { ...mockUserObj, reset_password_token: 'validtoken', reset_password_expires: new Date(Date.now() + 3600000) };
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(user);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUserObj);
      const result = await service.resetPassword('validtoken', 'newpass');
      expect(result.message).toBeDefined();
    });
  });

  describe('OAuthLogin', () => {
    it('should create new user if none exists', async () => {
      jest.spyOn(prisma.userProvider, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUserObj);
      const res = { cookie: jest.fn() } as any;
      await service.OAuthLogin({ id: '123', username: 'steamuser' }, 'steam', res);
      expect(res.cookie).toHaveBeenCalled();
    });
  });
});
