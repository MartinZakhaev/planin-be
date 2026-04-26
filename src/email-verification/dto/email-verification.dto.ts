import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
    @ApiProperty({ example: 'user@example.com' })
    email: string;

    @ApiProperty({ example: 'en', enum: ['en', 'id'], required: false })
    language?: 'en' | 'id';
}

export class VerifyOtpDto {
    @ApiProperty({ example: 'user@example.com' })
    email: string;

    @ApiProperty({ example: '123456', minLength: 6, maxLength: 6 })
    otp: string;
}

export class SendOtpResponseDto {
    @ApiProperty({ example: true })
    ok: boolean;

    @ApiProperty({ example: 'sent', enum: ['sent', 'already_verified'] })
    status: 'sent' | 'already_verified';

    @ApiProperty({ example: 600 })
    expiresInSeconds?: number;
}

export class VerifyOtpResponseDto {
    @ApiProperty({ example: true })
    ok: boolean;

    @ApiProperty({ example: true })
    emailVerified: boolean;
}
