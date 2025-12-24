import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PlanEntity } from './entities/plan.entity';

@Controller('plans')
@ApiTags('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) { }

  @Post()
  @ApiCreatedResponse({ type: PlanEntity })
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Get()
  @ApiOkResponse({ type: PlanEntity, isArray: true })
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: PlanEntity })
  async findOne(@Param('id') id: string) {
    const plan = await this.plansService.findOne(id);
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  @Patch(':id')
  @ApiOkResponse({ type: PlanEntity })
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(id, updatePlanDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: PlanEntity })
  remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }
}
