import { PhotosController } from './photos.controller';
import { Module } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';


@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],  
  controllers: [PhotosController],
  providers: [PhotosService]
})
export class PhotosModule {}
