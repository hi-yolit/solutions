// app/api/paystack/callback/route.ts

import { encryptString } from '@/lib/utils';
import { paystack } from '@/utils/paystack';
import { createServiceClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const baseUrl = process.env.NGROK_URL ?? process.env.NEXT_PUBLIC_APP_URL;

export async function GET(request: Request) {
    try {
        console.log('Callback URL:', request.url);

        const { searchParams } = new URL(request.url);
        const reference = searchParams.get('reference');

        console.log('Reference:', reference);

        if (!reference) {
            console.error('Missing reference in callback');
            return NextResponse.redirect(`${baseUrl}/pricing?error=missing-reference`);
        }

        // Verify the transaction first
        console.log('Attempting to verify transaction...');
        const transaction = await paystack.verifyTransaction(reference);
        console.log("Verify Transaction Response:", JSON.stringify(transaction, null, 2));

        if (!transaction.status || transaction.status !== 'success') {
            console.error('Transaction verification failed', transaction);
            return NextResponse.redirect(`${baseUrl}/pricing?error=payment-failed`);
        }

        // Get user from metadata
        const userId = transaction.metadata?.userId;
        console.log('User ID from metadata:', userId);

        if (!userId) {
            console.error('No user ID in transaction metadata');
            return NextResponse.redirect(`${baseUrl}/pricing?error=invalid-user`);
        }

        // Get subscription if plan exists
        let subscription = null;
        if (transaction.plan) {
            console.log('Attempting to get customer active subscription...');
            subscription = await paystack.getCustomerActiveSubscription(
                transaction.customer.customer_code,
                transaction.plan
            );
            console.log('Subscription details:', JSON.stringify(subscription, null, 2));
        }

        const supabase = createServiceClient();

        const { error: updateError } = await supabase
            .from('profile')
            .update({
                subscriptionStatus: 'ACTIVE',
                subscriptionCode: subscription?.subscription_code,
                encryptedToken: subscription ? encryptString(subscription.email_token) : null,
                currentPeriodEnd: subscription?.next_payment_date ? new Date(subscription.next_payment_date) : null,
                paystackCustomerId: transaction.customer.customer_code,
                updatedAt: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) {
            console.error('Error updating profile:', updateError);
            return NextResponse.redirect(`${baseUrl}/pricing?error=profile-update-failed`);
        }

        console.log('Profile updated successfully');
        return NextResponse.redirect(`${baseUrl}/account?success=subscription-active`);

    } catch (error) {
        console.error('Callback error:', error);
        return NextResponse.redirect(`${baseUrl}/pricing?error=unknown`);
    }
}