import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FileEntity } from './entities/file.entity';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createFileDto: CreateFileDto) {
    const file = await this.prisma.file.create({
      data: {
        ownerUserId: createFileDto.ownerUserId,
        projectId: createFileDto.projectId,
        kind: createFileDto.kind,
        filename: createFileDto.filename,
        mimeType: createFileDto.mimeType,
        sizeBytes: createFileDto.sizeBytes ? BigInt(createFileDto.sizeBytes) : null,
        storagePath: createFileDto.storagePath,
      },
    });
    return new FileEntity(file);
  }

  async findAll() {
    const files = await this.prisma.file.findMany();
    return files.map((file) => new FileEntity(file));
  }

  async findOne(id: string) {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });
    if (!file) return null;
    return new FileEntity(file);
  }

  async update(id: string, updateFileDto: UpdateFileDto) {
    const data: any = { ...updateFileDto };
    if (updateFileDto.sizeBytes !== undefined) {
      data.sizeBytes = updateFileDto.sizeBytes ? BigInt(updateFileDto.sizeBytes) : null;
    }

    const file = await this.prisma.file.update({
      where: { id },
      data,
    });
    return new FileEntity(file);
  }

  async remove(id: string) {
    const file = await this.prisma.file.delete({
      where: { id },
    });
    return new FileEntity(file);
  }
}
