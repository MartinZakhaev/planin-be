import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import {
    SendOtpDto,
    SendOtpResponseDto,
    VerifyOtpDto,
    VerifyOtpResponseDto,
} from './dto/email-verification.dto';
import { EmailVerificationService } from './email-verification.service';

@ApiTags('Email Verification')
@AllowAnonymous()
@Controller('api/email-verification')
export class EmailVerificationController {
    constructor(private readonly emailVerificationService: EmailVerificationService) { }

    @Post('send')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Send or resend email verification OTP',
        description: 'Sends a 6-digit OTP to an unverified account email address.',
    })
    @ApiBody({ type: SendOtpDto })
    @ApiResponse({ status: 200, type: SendOtpResponseDto })
    sendOtp(@Body() dto: SendOtpDto) {
        return this.emailVerificationService.sendOtp(dto.email, dto.language);
    }

    @Post('verify')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Verify email OTP',
        description: 'Verifies the submitted 6-digit OTP and marks the account email as verified.',
    })
    @ApiBody({ type: VerifyOtpDto })
    @ApiResponse({ status: 200, type: VerifyOtpResponseDto })
    verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.emailVerificationService.verifyOtp(dto.email, dto.otp);
    }
}
