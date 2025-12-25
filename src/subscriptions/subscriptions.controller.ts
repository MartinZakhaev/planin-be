import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { SubscriptionEntity } from './entities/subscription.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('subscriptions')
@ApiTags('subscriptions')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) { }

  @Post()
  @ApiCreatedResponse({ type: SubscriptionEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires subscription create permission.' })
  @RequirePermission('subscription', 'create')
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  @ApiOkResponse({ type: SubscriptionEntity, isArray: true })
  @RequirePermission('subscription', 'read')
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: SubscriptionEntity })
  @RequirePermission('subscription', 'read')
  async findOne(@Param('id') id: string) {
    const subscription = await this.subscriptionsService.findOne(id);
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  @Patch(':id')
  @ApiOkResponse({ type: SubscriptionEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires subscription update permission.' })
  @RequirePermission('subscription', 'update')
  update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: SubscriptionEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires subscription delete permission.' })
  @RequirePermission('subscription', 'delete')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }
}
