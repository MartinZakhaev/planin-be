import { Controller, Post, Body } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';

@Controller('webhooks')
@ApiTags('webhooks')
export class WebhookController {
    constructor(private readonly subscriptionsService: SubscriptionsService) { }

    @Post('midtrans')
    @ApiOkResponse({ description: 'Webhook received' })
    handleMidtrans(@Body() notification: any) {
        return this.subscriptionsService.handleWebhook(notification);
    }
}
