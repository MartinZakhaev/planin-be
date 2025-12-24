import { Module } from '@nestjs/common';
import { RabExportsService } from './rab-exports.service';
import { RabExportsController } from './rab-exports.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [RabExportsController],
  providers: [RabExportsService, PrismaService],
})
export class RabExportsModule { }
