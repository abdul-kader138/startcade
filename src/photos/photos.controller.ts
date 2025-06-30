import {
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import Lang from '../lang/lang';
import { PhotosService } from './photos.service';
import { SharpPipe } from './sharp.pipe';

// DTO to return after a successful upload
export class PhotoCreateOne {
  photo_id: number;
  serial: string;
}

@ApiTags('Photos')
@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  /**
   * GET /photos/:id
   * Returns the original image file by ID
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOkResponse({
    description: 'The image requested',
    type: StreamableFile,
  })
  @Header('Content-Type', 'image/webp')
  async getPhoto(@Param('id') id: string): Promise<StreamableFile> {
    const image = await this.photosService.findOne(id);
    if (!image) {
      throw new HttpException(
        `${Lang.photo_not_found_message} ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    const file = createReadStream(
      join(process.env.PHOTOS_BASE_PATH || '', image.original),
    );
    return new StreamableFile(file);
  }

  /**
   * GET /photos/:id/path
   * Returns the image record (paths only) by ID
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/path')
  @ApiOkResponse({
    description: 'The image requested',
    type: StreamableFile,
  })
  @Header('Content-Type', 'image/webp')
  async getPhotoPath(@Param('id') id: string): Promise<StreamableFile> {
    const image = await this.photosService.findOne(id);
    if (!image) {
      throw new HttpException(
        `${Lang.photo_not_found_message} ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return image; // returns metadata (likely JSON), not the actual image file
  }

  /**
   * GET /photos/:id/:size
   * Returns the image file in a specific size (small/medium/large/original)
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/:size')
  @Header('Content-Type', 'image/webp')
  async getPhotoWithSize(
    @Param('id') id: string,
    @Param('size') size: string,
  ): Promise<StreamableFile> {
    const image = await this.photosService.findOne(id);
    if (!image) {
      throw new HttpException(
        `${Lang.photo_not_found_message} ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Determine the appropriate file path based on requested size
    let imagePath;
    switch (size) {
      case 'small':
        imagePath = image.small;
        break;
      case 'medium':
        imagePath = image.medium;
        break;
      case 'large':
        imagePath = image.large;
        break;
      default:
        imagePath = image.original;
    }

    Logger.log(`Found image.: ${imagePath}`);
    const file = createReadStream(
      join(process.env.PHOTOS_BASE_PATH || '', imagePath),
    );
    return new StreamableFile(file);
  }

  /**
   * POST /photos/upload
   * Uploads and processes an image file
   * Applies SharpPipe for resizing, compression, etc.
   */
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOkResponse({
    description: 'The record has been successfully created.',
    type: PhotoCreateOne,
    isArray: true,
  })
  async uploadFile(
    @UploadedFile(SharpPipe) file: any,
  ): Promise<PhotoCreateOne> {
    const result = await this.photosService.create(file);

    return {
      photo_id: result.photo_id,
      serial: result.serial_id,
    };
  }

  /**
   * DELETE /photos/:id
   * Deletes the image files (all sizes) and database record
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    const result = await this.photosService.findOne(id);

    if (!result) {
      throw new HttpException(
        `${Lang.photo_not_found_message} ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const imageFiles = [
        result.small,
        result.medium,
        result.large,
        result.original,
      ];

      const PHOTOS_BASE_PATH = process.env.PHOTOS_BASE_PATH ?? './uploads';

      // Delete all image files (small, medium, large, original)
      await Promise.all(
        imageFiles.map((file) => unlink(join(PHOTOS_BASE_PATH, file))),
      );

      // Delete DB record
      await this.photosService.delete(result.photo_id);
    } catch (error) {
      Logger.error('Error while deleting files from disk', error.stack);
      throw error;
    }
  }
}
