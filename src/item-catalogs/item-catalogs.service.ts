import { Injectable } from '@nestjs/common';
import { CreateItemCatalogDto } from './dto/create-item-catalog.dto';
import { CreatePersonalItemCatalogDto } from './dto/create-personal-item-catalog.dto';
import { UpdateItemCatalogDto } from './dto/update-item-catalog.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ItemCatalogEntity } from './entities/item-catalog.entity';

@Injectable()
export class ItemCatalogsService {
  constructor(private readonly prisma: PrismaService) { }

  private sanitizePrefix(prefix?: string) {
    const normalized = (prefix || 'ITEM')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return (normalized || 'ITEM').slice(0, 24);
  }

  private async generatePersonalCode(prefix?: string) {
    const base = this.sanitizePrefix(prefix);
    const existingCount = await this.prisma.itemCatalog.count({
      where: {
        code: { startsWith: `${base}-` },
      },
    });

    for (let index = existingCount + 1; index < existingCount + 1000; index += 1) {
      const code = `${base}-${String(index).padStart(3, '0')}`;
      const existing = await this.prisma.itemCatalog.findUnique({
        where: { code },
        select: { id: true },
      });
      if (!existing) return code;
    }

    throw new Error(`Unable to generate item code for prefix ${base}`);
  }

  async create(createItemCatalogDto: CreateItemCatalogDto) {
    const catalog = await this.prisma.itemCatalog.create({
      data: createItemCatalogDto,
    });
    return new ItemCatalogEntity(catalog);
  }

  async createPersonal(userId: string, createItemCatalogDto: CreatePersonalItemCatalogDto) {
    const code = await this.generatePersonalCode(createItemCatalogDto.prefix);
    const catalog = await this.prisma.itemCatalog.create({
      data: {
        type: createItemCatalogDto.type,
        ownerUserId: userId,
        code,
        name: createItemCatalogDto.name,
        unitId: createItemCatalogDto.unitId,
        defaultPrice: createItemCatalogDto.defaultPrice,
        description: createItemCatalogDto.description,
      },
    });
    return new ItemCatalogEntity(catalog);
  }

  async findAll(userId?: string) {
    const catalogs = await this.prisma.itemCatalog.findMany({
      where: userId
        ? {
          OR: [
            { ownerUserId: null },
            { ownerUserId: userId },
          ],
        }
        : undefined,
      orderBy: [
        { ownerUserId: 'asc' },
        { code: 'asc' },
      ],
    });
    return catalogs.map((catalog) => new ItemCatalogEntity(catalog));
  }

  async findOne(id: string) {
    const catalog = await this.prisma.itemCatalog.findUnique({
      where: { id },
    });
    if (!catalog) return null;
    return new ItemCatalogEntity(catalog);
  }

  async update(id: string, updateItemCatalogDto: UpdateItemCatalogDto) {
    const catalog = await this.prisma.itemCatalog.update({
      where: { id },
      data: updateItemCatalogDto,
    });
    return new ItemCatalogEntity(catalog);
  }

  async remove(id: string) {
    const catalog = await this.prisma.itemCatalog.delete({
      where: { id },
    });
    return new ItemCatalogEntity(catalog);
  }
}
