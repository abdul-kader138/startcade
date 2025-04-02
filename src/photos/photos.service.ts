import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
@Injectable()
export class PhotosService {
  constructor() {}

  async create(file: any): Promise<any> {
    return await prisma.photos.create({
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
    return await prisma.photos.delete({
      where: {
        photo_id: id,
      },
    });
  }

  findOne(id: string): any {
    return prisma.photos.findFirst({
      where: {
        photo_id: Number(id),
      },
    });
  }
}
