import { Module } from '@nestjs/common';
import { RabExportsService } from './rab-exports.service';
import { RabExportsController } from './rab-exports.controller';

@Module({
  controllers: [RabExportsController],
  providers: [RabExportsService],
})
export class RabExportsModule {}
