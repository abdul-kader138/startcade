import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';

@Controller('articles') // Route prefix: /articles
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  /**
   * POST /articles/add
   * Create a new article
   * (Currently not protected by JWT auth, but can be uncommented)
   */
  // @UseGuards(JwtAuthGuard)
  @Post('add')
  async createArticle(@Body() createArticleDto: CreateArticleDto, @Req() req) {
    return this.articlesService.createArticle(createArticleDto);
  }

  /**
   * GET /articles
   * Fetch all articles
   */
  @Get()
  async getAllArticles() {
    return this.articlesService.getAllArticles();
  }

  /**
   * GET /articles/:id
   * Fetch a single article by its ID
   */
  @Get(':id')
  async getArticleById(@Param('id') id: string) {
    return this.articlesService.getArticleById(Number(id));
  }

  /**
   * DELETE /articles/:id
   * Delete an article by ID
   * Protected by JWT authentication
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteArticle(@Param('id') id: string) {
    return this.articlesService.deleteArticle(Number(id));
  }
}
