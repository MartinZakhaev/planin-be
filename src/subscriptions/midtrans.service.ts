import { Injectable } from '@nestjs/common';
import * as Midtrans from 'midtrans-client';
import { createHash } from 'crypto';

@Injectable()
export class MidtransService {
    private snap: InstanceType<typeof Midtrans.Snap>;

    constructor() {
        this.snap = new Midtrans.Snap({
            isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
            serverKey: process.env.MIDTRANS_SERVER_KEY!,
            clientKey: process.env.MIDTRANS_CLIENT_KEY!,
        });
    }

    async createSnapToken(params: {
        orderId: string;
        grossAmount: number;
        customerDetails: { firstName: string; email: string };
        itemDetails: { id: string; price: number; quantity: number; name: string };
    }): Promise<{ token: string; redirect_url: string }> {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const response = await this.snap.createTransaction({
            transaction_details: {
                order_id: params.orderId,
                gross_amount: params.grossAmount,
            },
            customer_details: {
                first_name: params.customerDetails.firstName,
                email: params.customerDetails.email,
            },
            item_details: [
                {
                    id: params.itemDetails.id,
                    price: params.itemDetails.price,
                    quantity: params.itemDetails.quantity,
                    name: params.itemDetails.name,
                },
            ],
            callbacks: {
                finish: `${frontendUrl}/dashboard/billing/success`,
            },
        });
        return response as { token: string; redirect_url: string };
    }

    verifySignature(orderId: string, statusCode: string, grossAmount: string, signatureKey: string): boolean {
        const expected = createHash('sha512')
            .update(`${orderId}${statusCode}${grossAmount}${process.env.MIDTRANS_SERVER_KEY}`)
            .digest('hex');
        return expected === signatureKey;
    }
}
