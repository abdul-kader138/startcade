import { Injectable, Logger, PipeTransform } from '@nestjs/common';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File, Promise<string>>
{
  async transform(image: Express.Multer.File): Promise<any> {
    Logger.log(process.env.PHOTOS_BASE_PATH);
    const photoBasePath = process.env.PHOTOS_BASE_PATH || './files/photos';
    const originalName = path.parse(image.originalname).name;
    const now = Date.now();
    const filename = (size: string): string =>
      `${now}-${originalName}${size}.webp`;
    const imageName = {
      serial: now,
      original: filename(''),
      large: filename('-large'),
      medium: filename('-medium'),
      small: filename('-small'),
    };

    await sharp(image.buffer)
      .webp({ effort: 3 })
      .toFile(path.join(photoBasePath, imageName.original));

    await sharp(image.buffer)
      .resize(800)
      .webp({ effort: 3 })
      .toFile(path.join(photoBasePath, imageName.large));

    await sharp(image.buffer)
      .resize(400)
      .webp({ effort: 3 })
      .toFile(path.join(photoBasePath, imageName.medium));

    await sharp(image.buffer)
      .resize(120)
      .webp({ effort: 3 })
      .toFile(path.join(photoBasePath, imageName.small));

    return imageName;
  }
}
