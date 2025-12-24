import { Injectable } from '@nestjs/common';
import { CreateItemCatalogDto } from './dto/create-item-catalog.dto';
import { UpdateItemCatalogDto } from './dto/update-item-catalog.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ItemCatalogEntity } from './entities/item-catalog.entity';

@Injectable()
export class ItemCatalogsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createItemCatalogDto: CreateItemCatalogDto) {
    const catalog = await this.prisma.itemCatalog.create({
      data: createItemCatalogDto,
    });
    return new ItemCatalogEntity(catalog);
  }

  async findAll() {
    const catalogs = await this.prisma.itemCatalog.findMany();
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
