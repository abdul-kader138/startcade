import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('ArticleService', () => {
  let service: ArticlesService;
  let prisma: DeepMockProxy<PrismaService>;
 beforeEach(async () => {
     prisma = mockDeep<PrismaService>(); // ✅ Mock PrismaService
 
     const module: TestingModule = await Test.createTestingModule({
       providers: [
        ArticlesService,
         {
           provide: PrismaService, // ✅ Provide Prisma mock here
           useValue: prisma,
         },
         {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
       ],
     }).compile();
 
     service = module.get<ArticlesService>(ArticlesService);
   });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
