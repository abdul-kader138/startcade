import { Test, TestingModule } from '@nestjs/testing';
import { PhotosService } from '../../../src/photos/photos.service';
import { PrismaClient } from '@prisma/client';

describe('PhotosService', () => {
  let service: PhotosService;
  let prisma: jest.Mocked<PrismaClient>;

  const mockDate = new Date('2025-04-07T15:15:13.886Z');

  const mockPhoto = {
    photo_id: 1,
    serial_id: 'abc123',
    original: 'original.jpg',
    small: 'small.jpg',
    medium: 'medium.jpg',
    large: 'large.jpg',
    created_on: mockDate,
    updated_on: mockDate,
  };

  const mockFile = {
    serial: 'abc123',
    original: 'original.jpg',
    small: 'small.jpg',
    medium: 'medium.jpg',
    large: 'large.jpg',
  };

  beforeEach(async () => {
    prisma = {
      photos: {
        create: jest.fn().mockResolvedValue(mockPhoto),
        delete: jest.fn().mockResolvedValue(mockPhoto),
        findFirst: jest.fn().mockResolvedValue(mockPhoto),
      },
    } as unknown as jest.Mocked<PrismaClient>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhotosService,
        {
          provide: PrismaClient,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<PhotosService>(PhotosService);
  });

  it('should create a new photo record', async () => {
    const result = await service.create(mockFile);
    expect(result).toEqual(mockPhoto);
  });

  it('should delete the photo record', async () => {
    const result = await service.delete(1);
    expect(result).toEqual(mockPhoto);
  });

  it('should return the photo by ID', async () => {
    const result = await service.findOne('1');
    expect(result).toEqual(mockPhoto);
  });
});
