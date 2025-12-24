import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from '../../generated/prisma/client';

export class CreateSubscriptionDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    planId: string;

    @ApiProperty({ enum: SubscriptionStatus, required: false, default: SubscriptionStatus.ACTIVE })
    @IsEnum(SubscriptionStatus)
    @IsOptional()
    status?: SubscriptionStatus;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    trialEndsAt?: string;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    currentPeriodStart?: string;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    currentPeriodEnd?: string;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    canceledAt?: string;
}

