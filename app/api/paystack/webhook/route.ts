import { NextRequest, NextResponse } from 'next/server';
import { paystack } from '@/utils/paystack';
import crypto from 'crypto';

export async function POST(req: NextRequest) {

  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing Paystack signature' }, { status: 400 });
    }

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    await paystack.handleWebhook(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}