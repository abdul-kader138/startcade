import { Test, TestingModule } from '@nestjs/testing';
import { PhotosService } from './photos.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { JwtService } from '@nestjs/jwt';

describe('ProtoService', () => {
  let service: PhotosService;
  let prisma: DeepMockProxy<PrismaService>;

 beforeEach(async () => {
     prisma = mockDeep<PrismaService>(); // ✅ Mock PrismaService
 
     const module: TestingModule = await Test.createTestingModule({
       providers: [
        PhotosService,
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
 
     service = module.get<PhotosService>(PhotosService);
   });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
