import { IsOptional, IsString } from 'class-validator';

export class EditUserDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  about_me?: string;
}
