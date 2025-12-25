import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { PlanEntity } from './entities/plan.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('plans')
@ApiTags('plans')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) { }

  @Post()
  @ApiCreatedResponse({ type: PlanEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Superadmin only.' })
  @RequirePermission('plan', 'create')
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Get()
  @ApiOkResponse({ type: PlanEntity, isArray: true })
  @RequirePermission('plan', 'read')
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: PlanEntity })
  @RequirePermission('plan', 'read')
  async findOne(@Param('id') id: string) {
    const plan = await this.plansService.findOne(id);
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  @Patch(':id')
  @ApiOkResponse({ type: PlanEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Superadmin only.' })
  @RequirePermission('plan', 'update')
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(id, updatePlanDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: PlanEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Superadmin only.' })
  @RequirePermission('plan', 'delete')
  remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }
}
