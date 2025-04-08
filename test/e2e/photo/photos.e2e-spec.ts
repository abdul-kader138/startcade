import { Test, TestingModule } from '@nestjs/testing';
import { PhotosService } from '../../../src/photos/photos.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('PhotosService', () => {
  let service: PhotosService;
  let prisma: jest.Mocked<PrismaService>; // Strongly typed PrismaService mock

  // A consistent timestamp used in mock data for created_on and updated_on fields
  const mockDate = new Date('2025-04-07T15:15:13.886Z');

  // Mocked response for a photo object
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

  // Input object representing a file to be saved
  const mockFile = {
    serial: 'abc123',
    original: 'original.jpg',
    small: 'small.jpg',
    medium: 'medium.jpg',
    large: 'large.jpg',
  };

  beforeEach(async () => {
    // Mock PrismaService's photos model methods
    prisma = {
      photos: {
        create: jest.fn().mockResolvedValue(mockPhoto),  // simulate create()
        delete: jest.fn().mockResolvedValue(mockPhoto),  // simulate delete()
        findFirst: jest.fn().mockResolvedValue(mockPhoto), // simulate findFirst()
      },
    } as unknown as jest.Mocked<PrismaService>;

    // Build NestJS testing module with mocked PrismaService
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhotosService,
        {
          provide: PrismaService,
          useValue: prisma, // inject the mock into the service
        },
      ],
    }).compile();

    // Retrieve the instance of PhotosService
    service = module.get<PhotosService>(PhotosService);
  });

  // ===================== TESTS =====================

  it('should create a new photo record', async () => {
    // Simulate saving a new photo using mockFile input
    const result = await service.create(mockFile);
    expect(prisma.photos.create).toHaveBeenCalled(); // ensure create() was called
    expect(result).toEqual(mockPhoto); // check output
  });

  it('should delete the photo record', async () => {
    // Simulate deleting a photo by ID
    const result = await service.delete(1);
    expect(prisma.photos.delete).toHaveBeenCalledWith({ where: { photo_id: 1 } }); // ensure correct params
    expect(result).toEqual(mockPhoto);
  });

  it('should return the photo by ID', async () => {
    // Simulate finding a photo by ID
    const result = await service.findOne('1');
    expect(prisma.photos.findFirst).toHaveBeenCalledWith({ where: { photo_id: 1 } }); // ensure correct query
    expect(result).toEqual(mockPhoto);
  });
});
