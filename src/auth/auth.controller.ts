import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import {
    SignUpEmailDto,
    SignInEmailDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    ChangePasswordDto,
    UpdateUserDto,
    AuthResponseDto,
    UserResponseDto,
    SessionResponseDto,
    OkResponseDto,
    ErrorResponseDto,
} from './dto/auth.dto';

/**
 * Auth Controller - Swagger Documentation Only
 * 
 * NOTE: These endpoints are handled by Better Auth via toNodeHandler in main.ts.
 * This controller exists only to provide Swagger documentation.
 * The actual route handling is done by Better Auth, not NestJS.
 */
@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
    // ======== Health Check ========

    @Get('ok')
    @ApiOperation({
        summary: 'Health check',
        description: 'Check if the auth service is running'
    })
    @ApiResponse({ status: 200, type: OkResponseDto, description: 'Auth service is running' })
    ok(): void {
        // Handled by Better Auth
    }

    // ======== Sign Up ========

    @Post('sign-up/email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Register with email/password',
        description: 'Create a new user account with email and password. Returns session token and user data.'
    })
    @ApiBody({ type: SignUpEmailDto })
    @ApiResponse({ status: 200, type: AuthResponseDto, description: 'User registered successfully' })
    @ApiResponse({ status: 400, type: ErrorResponseDto, description: 'Invalid input or email already exists' })
    signUpEmail(@Body() dto: SignUpEmailDto): void {
        // Handled by Better Auth
    }

    // ======== Sign In ========

    @Post('sign-in/email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Login with email/password',
        description: 'Authenticate user with email and password. Returns session token and sets session cookie.'
    })
    @ApiBody({ type: SignInEmailDto })
    @ApiResponse({ status: 200, type: AuthResponseDto, description: 'Login successful' })
    @ApiResponse({ status: 401, type: ErrorResponseDto, description: 'Invalid email or password' })
    signInEmail(@Body() dto: SignInEmailDto): void {
        // Handled by Better Auth
    }

    // ======== Sign Out ========

    @Post('sign-out')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('better-auth.session_token')
    @ApiOperation({
        summary: 'Logout',
        description: 'Invalidate the current session and clear session cookie'
    })
    @ApiResponse({ status: 200, type: OkResponseDto, description: 'Logged out successfully' })
    @ApiResponse({ status: 401, type: ErrorResponseDto, description: 'Not authenticated' })
    signOut(): void {
        // Handled by Better Auth
    }

    // ======== Session ========

    @Get('get-session')
    @ApiCookieAuth('better-auth.session_token')
    @ApiOperation({
        summary: 'Get current session',
        description: 'Get the current authenticated session and user data'
    })
    @ApiResponse({
        status: 200,
        description: 'Current session data',
        schema: {
            properties: {
                session: { $ref: '#/components/schemas/SessionResponseDto' },
                user: { $ref: '#/components/schemas/UserResponseDto' },
            }
        }
    })
    @ApiResponse({ status: 401, type: ErrorResponseDto, description: 'Not authenticated' })
    getSession(): void {
        // Handled by Better Auth
    }

    @Get('list-sessions')
    @ApiCookieAuth('better-auth.session_token')
    @ApiOperation({
        summary: 'List all sessions',
        description: 'Get all active sessions for the current user'
    })
    @ApiResponse({ status: 200, type: [SessionResponseDto], description: 'List of active sessions' })
    @ApiResponse({ status: 401, type: ErrorResponseDto, description: 'Not authenticated' })
    listSessions(): void {
        // Handled by Better Auth
    }

    @Post('revoke-session')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('better-auth.session_token')
    @ApiOperation({
        summary: 'Revoke a session',
        description: 'Revoke a specific session by token'
    })
    @ApiBody({
        schema: {
            properties: {
                token: { type: 'string', description: 'Session token to revoke' }
            },
            required: ['token']
        }
    })
    @ApiResponse({ status: 200, type: OkResponseDto, description: 'Session revoked' })
    @ApiResponse({ status: 401, type: ErrorResponseDto, description: 'Not authenticated' })
    revokeSession(): void {
        // Handled by Better Auth
    }

    // ======== Password Management ========

    @Post('forget-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Request password reset',
        description: 'Send password reset email to the user'
    })
    @ApiBody({ type: ForgotPasswordDto })
    @ApiResponse({ status: 200, type: OkResponseDto, description: 'Reset email sent (if email exists)' })
    forgetPassword(@Body() dto: ForgotPasswordDto): void {
        // Handled by Better Auth
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Reset password with token',
        description: 'Reset password using the token received via email'
    })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({ status: 200, type: OkResponseDto, description: 'Password reset successful' })
    @ApiResponse({ status: 400, type: ErrorResponseDto, description: 'Invalid or expired token' })
    resetPassword(@Body() dto: ResetPasswordDto): void {
        // Handled by Better Auth
    }

    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('better-auth.session_token')
    @ApiOperation({
        summary: 'Change password',
        description: 'Change password for authenticated user'
    })
    @ApiBody({ type: ChangePasswordDto })
    @ApiResponse({ status: 200, type: OkResponseDto, description: 'Password changed successfully' })
    @ApiResponse({ status: 400, type: ErrorResponseDto, description: 'Current password incorrect' })
    @ApiResponse({ status: 401, type: ErrorResponseDto, description: 'Not authenticated' })
    changePassword(@Body() dto: ChangePasswordDto): void {
        // Handled by Better Auth
    }

    // ======== User Profile ========

    @Post('update-user')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('better-auth.session_token')
    @ApiOperation({
        summary: 'Update user profile',
        description: 'Update the current user\'s name and/or image'
    })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({ status: 200, type: UserResponseDto, description: 'User updated successfully' })
    @ApiResponse({ status: 401, type: ErrorResponseDto, description: 'Not authenticated' })
    updateUser(@Body() dto: UpdateUserDto): void {
        // Handled by Better Auth
    }

    // ======== Email Verification ========

    @Post('send-verification-email')
    @HttpCode(HttpStatus.OK)
    @ApiCookieAuth('better-auth.session_token')
    @ApiOperation({
        summary: 'Send verification email',
        description: 'Send email verification link to the current user'
    })
    @ApiBody({
        schema: {
            properties: {
                callbackURL: { type: 'string', description: 'URL to redirect after verification' }
            }
        }
    })
    @ApiResponse({ status: 200, type: OkResponseDto, description: 'Verification email sent' })
    @ApiResponse({ status: 401, type: ErrorResponseDto, description: 'Not authenticated' })
    sendVerificationEmail(): void {
        // Handled by Better Auth
    }

    @Get('verify-email')
    @ApiOperation({
        summary: 'Verify email',
        description: 'Verify email address using the token from the verification email'
    })
    @ApiResponse({ status: 302, description: 'Redirects to callback URL after verification' })
    @ApiResponse({ status: 400, type: ErrorResponseDto, description: 'Invalid or expired token' })
    verifyEmail(): void {
        // Handled by Better Auth
    }
}
