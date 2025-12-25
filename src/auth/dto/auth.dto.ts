import { ApiProperty } from '@nestjs/swagger';

// ======== Request DTOs ========

export class SignUpEmailDto {
    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    email: string;

    @ApiProperty({ example: 'SecureP@ssw0rd!', description: 'User password (min 8 characters)' })
    password: string;

    @ApiProperty({ example: 'John Doe', description: 'User full name', required: false })
    name?: string;
}

export class SignInEmailDto {
    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    email: string;

    @ApiProperty({ example: 'SecureP@ssw0rd!', description: 'User password' })
    password: string;
}

export class ForgotPasswordDto {
    @ApiProperty({ example: 'user@example.com', description: 'Email address to receive reset link' })
    email: string;

    @ApiProperty({ example: 'https://myapp.com/reset-password', description: 'URL to redirect after clicking reset link' })
    redirectTo: string;
}

export class ResetPasswordDto {
    @ApiProperty({ description: 'Reset token received via email' })
    token: string;

    @ApiProperty({ example: 'NewSecureP@ssw0rd!', description: 'New password' })
    newPassword: string;
}

export class ChangePasswordDto {
    @ApiProperty({ description: 'Current password' })
    currentPassword: string;

    @ApiProperty({ description: 'New password' })
    newPassword: string;
}

export class UpdateUserDto {
    @ApiProperty({ example: 'John Doe', description: 'User full name', required: false })
    name?: string;

    @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'User profile image URL', required: false })
    image?: string;
}

// ======== Response DTOs ========

export class UserResponseDto {
    @ApiProperty({ example: 'abc123xyz', description: 'User ID' })
    id: string;

    @ApiProperty({ example: 'user@example.com' })
    email: string;

    @ApiProperty({ example: false })
    emailVerified: boolean;

    @ApiProperty({ example: 'John Doe', nullable: true })
    name: string | null;

    @ApiProperty({ example: null, nullable: true })
    image: string | null;

    @ApiProperty({ example: 'user', enum: ['superadmin', 'admin', 'staff', 'user'] })
    role: string;

    @ApiProperty({ example: false })
    banned: boolean;

    @ApiProperty({ example: null, nullable: true })
    banReason: string | null;

    @ApiProperty({ example: null, nullable: true })
    banExpires: Date | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class AuthResponseDto {
    @ApiProperty({ description: 'Session token for API authentication' })
    token: string;

    @ApiProperty({ type: UserResponseDto })
    user: UserResponseDto;

    @ApiProperty({ example: false, required: false })
    redirect?: boolean;
}

export class SessionResponseDto {
    @ApiProperty({ description: 'Session ID' })
    id: string;

    @ApiProperty({ description: 'User ID' })
    userId: string;

    @ApiProperty()
    expiresAt: Date;

    @ApiProperty({ nullable: true })
    ipAddress: string | null;

    @ApiProperty({ nullable: true })
    userAgent: string | null;
}

export class OkResponseDto {
    @ApiProperty({ example: true })
    ok: boolean;
}

export class ErrorResponseDto {
    @ApiProperty({ example: 'INVALID_EMAIL_OR_PASSWORD' })
    code: string;

    @ApiProperty({ example: 'Invalid email or password' })
    message: string;
}
