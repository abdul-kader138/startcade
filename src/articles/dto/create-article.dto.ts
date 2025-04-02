import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  video_url?: string;

  @IsInt()
  @IsOptional()
  photo_id?: number; 
}
