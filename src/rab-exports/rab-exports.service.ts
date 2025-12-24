import { Injectable } from '@nestjs/common';
import { CreateRabExportDto } from './dto/create-rab-export.dto';
import { UpdateRabExportDto } from './dto/update-rab-export.dto';

@Injectable()
export class RabExportsService {
  create(createRabExportDto: CreateRabExportDto) {
    return 'This action adds a new rabExport';
  }

  findAll() {
    return `This action returns all rabExports`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rabExport`;
  }

  update(id: number, updateRabExportDto: UpdateRabExportDto) {
    return `This action updates a #${id} rabExport`;
  }

  remove(id: number) {
    return `This action removes a #${id} rabExport`;
  }
}
