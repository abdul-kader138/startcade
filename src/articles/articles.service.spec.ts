import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service';
import { JwtService } from '@nestjs/jwt';

describe('ArticleService', () => {
  let service: ArticlesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArticlesService,{
                      provide: JwtService,
                      useValue: {
                        sign: jest.fn().mockReturnValue('mock-jwt-token'),
                      },
                    },],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
