import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from '../../../src/articles/articles.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import Lang from '../../../src/lang/lang';
import { CreateArticleDto } from '../../../src/articles/dto/create-article.dto';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prisma = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  // ===================== CREATE ARTICLE =====================
  describe('createArticle', () => {
    it('should create and return the article', async () => {
      const dto: CreateArticleDto = {
        title: 'Test Article',
        description: 'Test Description',
        content: 'Test Content',
        video_url: 'https://example.com/video.mp4',
        photo_id: 1,
      };

      const mockArticle:any = { id: 1, ...dto };
      prisma.article.create.mockResolvedValue(mockArticle);

      const result = await service.createArticle(dto);
      expect(result).toEqual(mockArticle);
      expect(prisma.article.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
  });

  // ===================== GET ALL ARTICLES =====================
  describe('getAllArticles', () => {
    it('should return a list of articles with photos', async () => {
      const mockArticles = [
        { id: 1, title: 'A', photo: {} },
        { id: 2, title: 'B', photo: {} },
      ];

      prisma.article.findMany.mockResolvedValue(mockArticles as any);

      const result = await service.getAllArticles();
      expect(result).toEqual(mockArticles);
      expect(prisma.article.findMany).toHaveBeenCalledWith({
        include: { photo: true },
      });
    });
  });

  // ===================== GET ARTICLE BY ID =====================
  describe('getArticleById', () => {
    it('should return article if found', async () => {
      const mockArticle = { id: 1, title: 'Article', photo: {} };
      prisma.article.findUnique.mockResolvedValue(mockArticle as any);

      const result = await service.getArticleById(1);
      expect(result).toEqual(mockArticle);
      expect(prisma.article.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { photo: true },
      });
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.article.findUnique.mockResolvedValue(null);

      await expect(service.getArticleById(999)).rejects.toThrow(
        new NotFoundException(Lang.article_not_found_message)
      );
    });
  });

  // ===================== DELETE ARTICLE =====================
  describe('deleteArticle', () => {
    it('should delete and return the article', async () => {
      const mockDeleted = { id: 1, title: 'Deleted Article' };
      prisma.article.delete.mockResolvedValue(mockDeleted as any);

      const result = await service.deleteArticle(1);
      expect(result).toEqual(mockDeleted);
      expect(prisma.article.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
