import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PhotosService {
  constructor(private prisma:PrismaService) {}

  async create(file: any): Promise<any> {
    return await this.prisma.photos.create({
      data: {
        serial_id: `${file.serial}`,
        original: file.original,
        small: file.small,
        medium: file.medium,
        large: file.large,
      },
    });
  }

  async delete(id: number): Promise<any> {
    return await this.prisma.photos.delete({
      where: {
        photo_id: id,
      },
    });
  }

  findOne(id: string): any {
    return this.prisma.photos.findFirst({
      where: {
        photo_id: Number(id),
      },
    });
  }
}
