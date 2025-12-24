import { Module } from '@nestjs/common';
import { RabSummariesService } from './rab-summaries.service';
import { RabSummariesController } from './rab-summaries.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RabSummariesController],
  providers: [RabSummariesService, PrismaService],
})
export class RabSummariesModule { }
