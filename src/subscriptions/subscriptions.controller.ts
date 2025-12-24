import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SubscriptionEntity } from './entities/subscription.entity';

@Controller('subscriptions')
@ApiTags('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) { }

  @Post()
  @ApiCreatedResponse({ type: SubscriptionEntity })
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  @ApiOkResponse({ type: SubscriptionEntity, isArray: true })
  findAll() {
    return this.subscriptionsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: SubscriptionEntity })
  async findOne(@Param('id') id: string) {
    const subscription = await this.subscriptionsService.findOne(id);
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  @Patch(':id')
  @ApiOkResponse({ type: SubscriptionEntity })
  update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: SubscriptionEntity })
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }
}
