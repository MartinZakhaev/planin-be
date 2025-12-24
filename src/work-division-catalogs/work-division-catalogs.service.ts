import { Injectable } from '@nestjs/common';
import { CreateWorkDivisionCatalogDto } from './dto/create-work-division-catalog.dto';
import { UpdateWorkDivisionCatalogDto } from './dto/update-work-division-catalog.dto';

@Injectable()
export class WorkDivisionCatalogsService {
  create(createWorkDivisionCatalogDto: CreateWorkDivisionCatalogDto) {
    return 'This action adds a new workDivisionCatalog';
  }

  findAll() {
    return `This action returns all workDivisionCatalogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} workDivisionCatalog`;
  }

  update(id: number, updateWorkDivisionCatalogDto: UpdateWorkDivisionCatalogDto) {
    return `This action updates a #${id} workDivisionCatalog`;
  }

  remove(id: number) {
    return `This action removes a #${id} workDivisionCatalog`;
  }
}
