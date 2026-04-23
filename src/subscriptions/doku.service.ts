import { Injectable } from '@nestjs/common';
import { createHmac, randomUUID, createHash } from 'crypto';

interface DokuCheckoutParams {
    order: {
        amount: number;
        invoice_number: string;
        currency?: string;
        callback_url?: string;
    };
    payment?: {
        payment_due_date?: number;
        payment_method_types?: string[];
    };
    customer?: {
        name: string;
        email: string;
        phone?: string;
    };
    billing_address?: Record<string, any>;
    shipping_address?: Record<string, any>;
}

interface DokuCheckoutResponse {
    token_id: string;
    url: string;
    expired_date: string;
    expired_datetime: string;
}

@Injectable()
export class DokuService {
    private readonly baseUrl: string;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly requestTarget = '/checkout/v1/payment';

    constructor() {
        const isProduction = process.env.DOKU_IS_PRODUCTION === 'true';
        this.baseUrl = isProduction
            ? 'https://api.doku.com/checkout/v1/payment'
            : 'https://api-sandbox.doku.com/checkout/v1/payment';
        this.clientId = process.env.DOKU_CLIENT_ID ?? '';
        this.clientSecret = process.env.DOKU_CLIENT_SECRET ?? '';
    }

    private generateDigest(body: string): string {
        return createHash('sha256').update(body).digest('base64');
    }

    private generateSignature(requestId: string, timestamp: string, digest: string): string {
        const rawString = `Client-Id:${this.clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${this.requestTarget}\nDigest:${digest}`;
        return `HMACSHA256=${createHmac('sha256', this.clientSecret)
            .update(rawString)
            .digest('base64')}`;
    }

    async createCheckout(params: DokuCheckoutParams): Promise<DokuCheckoutResponse> {
        const requestId = randomUUID();
        const timestamp = new Date().toISOString().replace(/\.\d{3}/, '');
        const body = JSON.stringify(params);
        const digest = this.generateDigest(body);
        const signature = this.generateSignature(requestId, timestamp, digest);

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Client-Id': this.clientId,
                'Request-Id': requestId,
                'Request-Timestamp': timestamp,
                'Request-Target': this.requestTarget,
                'Digest': digest,
                'Signature': signature,
            },
            body,
        });

        const data = await response.json() as any;

        if (!response.ok) {
            const message = data.error_messages?.join(', ') || data.message?.join(', ') || `Doku checkout failed: ${response.status}`;
            console.error('Doku error response:', JSON.stringify(data, null, 2));
            throw new Error(message);
        }

        return {
            token_id: data.response.payment.token_id,
            url: data.response.payment.url,
            expired_date: data.response.payment.expired_date,
            expired_datetime: data.response.payment.expired_datetime,
        };
    }

    verifyWebhookSignature(requestId: string, timestamp: string, body: string, signature: string): boolean {
        const digest = this.generateDigest(body);
        const expectedSignature = this.generateSignature(requestId, timestamp, digest);
        return expectedSignature === signature;
    }
}
