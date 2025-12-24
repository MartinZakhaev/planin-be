import { Injectable } from '@nestjs/common';
import { CreateRabSummaryDto } from './dto/create-rab-summary.dto';
import { UpdateRabSummaryDto } from './dto/update-rab-summary.dto';

@Injectable()
export class RabSummariesService {
  create(createRabSummaryDto: CreateRabSummaryDto) {
    return 'This action adds a new rabSummary';
  }

  findAll() {
    return `This action returns all rabSummaries`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rabSummary`;
  }

  update(id: number, updateRabSummaryDto: UpdateRabSummaryDto) {
    return `This action updates a #${id} rabSummary`;
  }

  remove(id: number) {
    return `This action removes a #${id} rabSummary`;
  }
}
