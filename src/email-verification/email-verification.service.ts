import {
    BadGatewayException,
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { createHash, randomInt, randomUUID, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

type Language = 'en' | 'id';

const OTP_LENGTH = 6;
const OTP_TTL_SECONDS = 10 * 60;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

interface StoredOtp {
    hash: string;
    attempts: number;
}

@Injectable()
export class EmailVerificationService {
    constructor(private readonly prisma: PrismaService) { }

    async sendOtp(email: string, language: Language = 'en') {
        const normalizedEmail = this.normalizeEmail(email);
        const user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, email: true, emailVerified: true, fullName: true },
        });

        if (!user) {
            throw new NotFoundException('No account was found for this email address.');
        }

        if (user.emailVerified) {
            return { ok: true, status: 'already_verified' as const };
        }

        const identifier = this.identifierFor(normalizedEmail);
        const latestOtp = await this.getLatestOtpTiming(identifier);

        if (latestOtp) {
            const retryAfterSeconds = RESEND_COOLDOWN_SECONDS - latestOtp.ageSeconds;

            if (retryAfterSeconds > 0) {
                throw new HttpException(
                    {
                        message: `Please wait ${retryAfterSeconds} seconds before requesting another code.`,
                        code: 'OTP_RATE_LIMITED',
                        retryAfterSeconds,
                    },
                    HttpStatus.TOO_MANY_REQUESTS,
                );
            }
        }

        const otp = this.generateOtp();
        const storedOtp = JSON.stringify({
            hash: this.hashOtp(normalizedEmail, otp),
            attempts: 0,
        } satisfies StoredOtp);

        await this.prisma.verification.deleteMany({ where: { identifier } });
        await this.prisma.$executeRaw`
            INSERT INTO verifications (id, identifier, value, expires_at, created_at, updated_at)
            VALUES (
                ${randomUUID()},
                ${identifier},
                ${storedOtp},
                now() + make_interval(secs => ${OTP_TTL_SECONDS}),
                now(),
                now()
            )
        `;

        await this.sendEmail({
            to: normalizedEmail,
            name: user.fullName,
            otp,
            language,
        });

        return { ok: true, status: 'sent' as const, expiresInSeconds: OTP_TTL_SECONDS };
    }

    async verifyOtp(email: string, otp: string) {
        const normalizedEmail = this.normalizeEmail(email);

        if (!/^\d{6}$/.test(otp)) {
            throw new BadRequestException('Enter the 6-digit verification code.');
        }

        const user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, emailVerified: true },
        });

        if (!user) {
            throw new BadRequestException('Invalid or expired verification code.');
        }

        if (user.emailVerified) {
            return { ok: true, emailVerified: true };
        }

        const identifier = this.identifierFor(normalizedEmail);
        const verification = await this.prisma.verification.findFirst({
            where: { identifier },
            orderBy: { createdAt: 'desc' },
        });

        if (!verification || await this.isExpired(verification.id)) {
            await this.prisma.verification.deleteMany({ where: { identifier } });
            throw new BadRequestException('Invalid or expired verification code.');
        }

        const storedOtp = this.parseStoredOtp(verification.value);
        const expectedHash = this.hashOtp(normalizedEmail, otp);

        if (!this.safeEqual(storedOtp.hash, expectedHash)) {
            const attempts = storedOtp.attempts + 1;

            if (attempts >= MAX_ATTEMPTS) {
                await this.prisma.verification.deleteMany({ where: { identifier } });
                throw new BadRequestException('Too many incorrect attempts. Please request a new code.');
            }

            await this.prisma.verification.update({
                where: { id: verification.id },
                data: { value: JSON.stringify({ ...storedOtp, attempts } satisfies StoredOtp) },
            });

            throw new BadRequestException('Invalid verification code.');
        }

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: true },
            }),
            this.prisma.verification.deleteMany({ where: { identifier } }),
        ]);

        return { ok: true, emailVerified: true };
    }

    private normalizeEmail(email: string) {
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            throw new BadRequestException('Enter a valid email address.');
        }

        return normalizedEmail;
    }

    private identifierFor(email: string) {
        return `email-verification-otp:${email}`;
    }

    private generateOtp() {
        return randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, '0');
    }

    private hashOtp(email: string, otp: string) {
        const secret = process.env.OTP_SECRET || process.env.BETTER_AUTH_SECRET || process.env.SESSION_SECRET || 'planin-local-otp-secret';
        return createHash('sha256').update(`${email}:${otp}:${secret}`).digest('hex');
    }

    private parseStoredOtp(value: string): StoredOtp {
        try {
            const parsed = JSON.parse(value) as Partial<StoredOtp>;

            if (typeof parsed.hash === 'string' && typeof parsed.attempts === 'number') {
                return { hash: parsed.hash, attempts: parsed.attempts };
            }
        } catch {
            // Older or malformed values should be treated as invalid.
        }

        return { hash: '', attempts: MAX_ATTEMPTS };
    }

    private safeEqual(a: string, b: string) {
        const left = Buffer.from(a);
        const right = Buffer.from(b);

        return left.length === right.length && timingSafeEqual(left, right);
    }

    private async isExpired(id: string) {
        const result = await this.prisma.$queryRaw<Array<{ is_expired: boolean }>>`
            SELECT expires_at <= now() AS is_expired
            FROM verifications
            WHERE id = ${id}
            LIMIT 1
        `;

        return result[0]?.is_expired ?? true;
    }

    private async getLatestOtpTiming(identifier: string) {
        const result = await this.prisma.$queryRaw<Array<{ age_seconds: number }>>`
            SELECT floor(extract(epoch from (now() - created_at)))::int AS age_seconds
            FROM verifications
            WHERE identifier = ${identifier}
            ORDER BY created_at DESC
            LIMIT 1
        `;

        const row = result[0];

        if (!row) {
            return null;
        }

        return { ageSeconds: Number(row.age_seconds) };
    }

    private async sendEmail({
        to,
        name,
        otp,
        language,
    }: {
        to: string;
        name: string | null;
        otp: string;
        language: Language;
    }) {
        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.RESEND_FROM_EMAIL || 'Planin <onboarding@resend.dev>';
        const subject = language === 'id' ? 'Kode verifikasi Planin Anda' : 'Your Planin verification code';
        const greeting = language === 'id'
            ? `Halo${name ? ` ${name}` : ''},`
            : `Hi${name ? ` ${name}` : ''},`;
        const intro = language === 'id'
            ? 'Gunakan kode berikut untuk memverifikasi alamat email Anda:'
            : 'Use the code below to verify your email address:';
        const expiry = language === 'id'
            ? 'Kode ini berlaku selama 10 menit. Jika Anda tidak meminta kode ini, abaikan email ini.'
            : 'This code expires in 10 minutes. If you did not request it, you can safely ignore this email.';

        if (!apiKey) {
            if (process.env.NODE_ENV === 'production') {
                throw new BadGatewayException('Email delivery is not configured.');
            }

            console.warn(`[EmailVerification] RESEND_API_KEY is not set. OTP for ${to}: ${otp}`);
            return;
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from,
                to,
                subject,
                html: `
                    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
                        <p>${greeting}</p>
                        <p>${intro}</p>
                        <p style="font-size:32px;font-weight:700;letter-spacing:8px;margin:24px 0">${otp}</p>
                        <p style="color:#6b7280">${expiry}</p>
                    </div>
                `,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text().catch(() => '');
            console.error('[EmailVerification] Resend error:', errorBody);
            throw new BadGatewayException('Failed to send verification email.');
        }
    }
}
