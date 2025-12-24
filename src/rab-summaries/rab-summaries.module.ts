import { Module } from '@nestjs/common';
import { RabSummariesService } from './rab-summaries.service';
import { RabSummariesController } from './rab-summaries.controller';

@Module({
  controllers: [RabSummariesController],
  providers: [RabSummariesService],
})
export class RabSummariesModule {}
