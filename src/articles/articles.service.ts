import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import Lang from '../lang/lang';
import { CreateArticleDto } from './dto/create-article.dto';

const prisma = new PrismaClient();
@Injectable()
export class ArticlesService {
  constructor() {}

  async createArticle(createArticleDto: CreateArticleDto) {
    return prisma.article.create({
      data: {
        title: createArticleDto.title,
        description: createArticleDto.description,
        content: createArticleDto.content,
        video_url: createArticleDto.video_url || null,
        photo_id: createArticleDto.photo_id || null,
      },
    });
  }

  async getAllArticles() {
    return prisma.article.findMany({
      include: {
        photo: true,
      },
    });
  }

  async getArticleById(id: number) {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        photo: true,
      },
    });

    if (!article) {
      throw new NotFoundException(Lang.article_not_found_message);
    }

    return article;
  }

  async deleteArticle(id: number) {
    return prisma.article.delete({ where: { id } });
  }
}
