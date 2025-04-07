import { Injectable, NotFoundException } from '@nestjs/common';
import Lang from '../lang/lang';
import { CreateArticleDto } from './dto/create-article.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ArticlesService {
  constructor(private prisma:PrismaService) {}

  async createArticle(createArticleDto: CreateArticleDto) {
    return this.prisma.article.create({
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
    return this.prisma.article.findMany({
      include: {
        photo: true,
      },
    });
  }

  async getArticleById(id: number) {
    const article = await this.prisma.article.findUnique({
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
    return this.prisma.article.delete({ where: { id } });
  }
}
