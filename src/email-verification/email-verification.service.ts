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
        const content = this.buildVerificationEmail({ name, otp, language });

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
                subject: content.subject,
                html: content.html,
                text: content.text,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text().catch(() => '');
            console.error('[EmailVerification] Resend error:', errorBody);
            throw new BadGatewayException('Failed to send verification email.');
        }
    }

    private buildVerificationEmail({
        name,
        otp,
        language,
    }: {
        name: string | null;
        otp: string;
        language: Language;
    }) {
        const safeName = this.escapeHtml(name?.trim() || '');
        const displayName = safeName || (language === 'id' ? 'Pengguna Planin' : 'Planin user');
        const otpDigits = otp.split('');

        const copy = language === 'id'
            ? {
                subject: 'Kode verifikasi Planin Anda',
                eyebrow: 'Verifikasi email',
                title: 'Selesaikan verifikasi email Anda',
                greeting: `Halo ${displayName},`,
                intro: 'Masukkan kode verifikasi berikut untuk mengaktifkan akun Planin Anda.',
                codeLabel: 'Kode verifikasi',
                expires: 'Kode ini berlaku selama 10 menit.',
                securityTitle: 'Catatan keamanan',
                securityBody: 'Jika Anda tidak meminta kode ini, abaikan email ini. Jangan bagikan kode ini kepada siapa pun, termasuk pihak yang mengaku dari Planin.',
                footer: 'Email otomatis ini dikirim untuk membantu mengamankan akun Planin Anda.',
                support: 'Butuh bantuan? Hubungi tim dukungan Planin.',
                textIntro: 'Masukkan kode berikut untuk mengaktifkan akun Planin Anda.',
                textSecurity: 'Jangan bagikan kode ini kepada siapa pun. Jika Anda tidak meminta kode ini, abaikan email ini.',
            }
            : {
                subject: 'Your Planin verification code',
                eyebrow: 'Email verification',
                title: 'Complete your email verification',
                greeting: `Hi ${displayName},`,
                intro: 'Enter the verification code below to activate your Planin account.',
                codeLabel: 'Verification code',
                expires: 'This code expires in 10 minutes.',
                securityTitle: 'Security note',
                securityBody: 'If you did not request this code, you can safely ignore this email. Never share this code with anyone, including people claiming to be from Planin.',
                footer: 'This automated email was sent to help secure your Planin account.',
                support: 'Need help? Contact Planin support.',
                textIntro: 'Enter the code below to activate your Planin account.',
                textSecurity: 'Never share this code with anyone. If you did not request it, you can safely ignore this email.',
            };

        const codeHtml = otpDigits
            .map((digit) => `
                <td style="width:44px;height:56px;border:1px solid #D7DEE8;border-radius:10px;background:#FFFFFF;text-align:center;font-size:28px;line-height:56px;font-weight:700;color:#101828;font-family:Inter,Arial,sans-serif;">
                    ${digit}
                </td>
            `)
            .join('<td style="width:8px;"></td>');

        const html = `
<!doctype html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${copy.subject}</title>
</head>
<body style="margin:0;padding:0;background:#F4F7FB;font-family:Inter,Arial,sans-serif;color:#101828;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#F4F7FB;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;">
          <tr>
            <td style="padding:0 4px 18px;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;">
                <tr>
                  <td style="font-size:22px;font-weight:800;letter-spacing:0;color:#101828;">Planin</td>
                  <td align="right" style="font-size:12px;font-weight:700;color:#475467;text-transform:uppercase;letter-spacing:1.2px;">${copy.eyebrow}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#FFFFFF;border:1px solid #E4EAF2;border-radius:18px;box-shadow:0 18px 48px rgba(16,24,40,0.08);overflow:hidden;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:32px 32px 24px;background:#0F172A;">
                    <div style="font-size:12px;font-weight:700;color:#A7F3D0;text-transform:uppercase;letter-spacing:1.4px;margin-bottom:10px;">Planin secure access</div>
                    <h1 style="margin:0;font-size:28px;line-height:36px;font-weight:800;color:#FFFFFF;">${copy.title}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 12px;font-size:16px;line-height:26px;color:#101828;">${copy.greeting}</p>
                    <p style="margin:0;font-size:16px;line-height:26px;color:#344054;">${copy.intro}</p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:28px 0;">
                      <tr>
                        <td style="padding:18px;border:1px solid #E4EAF2;border-radius:16px;background:#F8FAFC;">
                          <div style="font-size:12px;font-weight:700;color:#667085;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:12px;">${copy.codeLabel}</div>
                          <table role="presentation" cellspacing="0" cellpadding="0" align="center">
                            <tr>${codeHtml}</tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 20px;font-size:14px;line-height:22px;color:#475467;">${copy.expires}</p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #D0D5DD;border-radius:14px;background:#FFFFFF;">
                      <tr>
                        <td style="padding:16px 18px;">
                          <p style="margin:0 0 6px;font-size:14px;line-height:22px;font-weight:700;color:#101828;">${copy.securityTitle}</p>
                          <p style="margin:0;font-size:13px;line-height:21px;color:#475467;">${copy.securityBody}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 4px 0;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;line-height:18px;color:#667085;">${copy.footer}</p>
              <p style="margin:0;font-size:12px;line-height:18px;color:#98A2B3;">${copy.support}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `.trim();

        const text = [
            'Planin',
            copy.title,
            '',
            copy.greeting,
            copy.textIntro,
            '',
            `${copy.codeLabel}: ${otp}`,
            copy.expires,
            '',
            copy.textSecurity,
        ].join('\n');

        return {
            subject: copy.subject,
            html,
            text,
        };
    }

    private escapeHtml(value: string) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
