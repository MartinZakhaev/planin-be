import { PartialType } from '@nestjs/swagger';
import { CreateRabSummaryDto } from './create-rab-summary.dto';

export class UpdateRabSummaryDto extends PartialType(CreateRabSummaryDto) {}
