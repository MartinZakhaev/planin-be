import { Subscription, SubscriptionStatus } from '../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionEntity implements Subscription {
    @ApiProperty()
    id: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    planId: string;

    @ApiProperty({ enum: SubscriptionStatus })
    status: SubscriptionStatus;

    @ApiProperty({ required: false, nullable: true })
    trialEndsAt: Date | null;

    @ApiProperty({ required: false, nullable: true })
    currentPeriodStart: Date | null;

    @ApiProperty({ required: false, nullable: true })
    currentPeriodEnd: Date | null;

    @ApiProperty({ required: false, nullable: true })
    canceledAt: Date | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    constructor(partial: Partial<SubscriptionEntity>) {
        Object.assign(this, partial);
    }
}

