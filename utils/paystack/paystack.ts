import axios, { AxiosInstance } from 'axios';
import { createServiceClient } from '@/utils/supabase/server';
import { SubscriptionStatus } from '@prisma/client';
import {
    PaystackPlan,
    PaystackSubscription,
    PaystackResponse
} from './types';
import { decryptString, encryptString } from '@/lib/utils';

const baseUrl = process.env.NGROK_URL || process.env.NEXT_PUBLIC_APP_URL;
const supabase = createServiceClient();

export class createPayStackClient {
    private readonly apiKey: string;
    private readonly axiosInstance: AxiosInstance;

    constructor(apiKey: string) {
        console.log('Initializing PayStack Client');
        console.log('API Key provided:', !!apiKey);

        if (!apiKey) {
            console.error('CRITICAL: No Paystack API Key provided');
            throw new Error('PAYSTACK_SECRET_KEY is required');
        }

        this.apiKey = apiKey;
        this.axiosInstance = axios.create({
            baseURL: 'https://api.paystack.co',
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async listPlans(query?: {
        perPage?: number;
        page?: number;
    }): Promise<PaystackPlan[]> {
        console.log('Listing Plans - Query:', query);
        try {
            const params = new URLSearchParams();
            if (query?.perPage) params.append('perPage', query.perPage.toString());
            if (query?.page) params.append('page', query.page.toString());

            const response = await this.axiosInstance.get<PaystackResponse<PaystackPlan[]>>(
                `/plan?${params.toString()}`
            );

            if (!response.data.status) {
                console.error('Failed to fetch plans:', response.data.message);
                throw new Error('Failed to fetch plans');
            }

            return response.data.data;
        } catch (error) {
            console.error('Error fetching plans:', error);
            throw error;
        }
    }

    async fetchPlan(planIdOrCode: string): Promise<PaystackPlan> {
        console.log('Fetching Plan:', planIdOrCode);
        try {
            const response = await this.axiosInstance.get<PaystackResponse<PaystackPlan>>(
                `/plan/${planIdOrCode}`
            );

            if (!response.data.status) {
                console.error('Failed to fetch plan:', response.data.message);
                throw new Error('Failed to fetch plan');
            }

            return response.data.data;
        } catch (error) {
            console.error('Error fetching plan:', error);
            throw error;
        }
    }

    async createCustomer(userId: string, email: string): Promise<string> {
        console.log('Creating Customer', { userId, email });
        try {
            const response = await this.axiosInstance.post('/customer', {
                email,
                metadata: {
                    userId
                }
            });

            if (!response.data.status) {
                console.error('Failed to create customer:', response.data.message);
                throw new Error('Failed to create customer');
            }

            const customerCode = response.data.data.customer_code;

            const { error: updateError } = await supabase
                .from('profile')
                .update({
                    paystackCustomerId: customerCode,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', userId);

            if (updateError) {
                console.error('Failed to update profile with customer ID:', updateError);
                throw updateError;
            }

            return customerCode;
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    }

    async initializeTransaction(email: string, planCode: string, userId: string) {
        console.log('Initializing Transaction', { email, planCode, userId });
        try {
            const response = await this.axiosInstance.post('/transaction/initialize', {
                email,
                plan: planCode,
                amount: 1,
                callback_url: `${baseUrl}/api/paystack/callback`,
                channels: ["card", "bank", "qr", "mobile_money", "eft"],
                metadata: {
                    userId
                }
            });

            if (!response.data.status) {
                console.error('Failed to initialize transaction:', response.data.message);
                throw new Error('Failed to initialize transaction');
            }

            return {
                authorizationUrl: response.data.data.authorization_url,
                reference: response.data.data.reference
            };
        } catch (error) {
            console.error('Error initializing transaction:', error);
            throw error;
        }
    }

    async verifyTransaction(reference: string) {
        console.log('Verifying Transaction:', reference);
        try {
            const response = await this.axiosInstance.get(`/transaction/verify/${reference}`);

            if (!response.data.status) {
                console.error('Transaction verification failed:', response.data.message);
                throw new Error('Transaction verification failed');
            }

            const { metadata, customer } = response.data.data;

            const { error: updateError } = await supabase
                .from('profile')
                .update({
                    subscriptionStatus: 'ACTIVE',
                    cancelAtPeriodEnd: false,
                    paystackCustomerId: customer.customer_code,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', metadata.userId);

            if (updateError) {
                console.error('Failed to update profile:', updateError);
                throw updateError;
            }

            return response.data.data;
        } catch (error) {
            console.error('Error verifying transaction:', error);
            throw error;
        }
    }

    async getCustomerActiveSubscription(customerCode: string | number, planId?: number): Promise<PaystackSubscription | null> {
        if (!customerCode) {
            console.error('Customer code is required');
            return null;
        }

        try {
            const response = await this.axiosInstance.get(`/customer/${customerCode}`);

            if (!response.data || !response.data.status) {
                throw new Error('Invalid response or failed to retrieve subscription details');
            }

            const subscriptions = response?.data?.data?.subscriptions || [];

            if (subscriptions.length === 0) {
                console.warn(`No subscriptions found for customer ${customerCode}`);
                return null;
            }

            const activeSubscriptionCodes = subscriptions
                .filter((sub: any) => sub.status === 'active' && sub.subscription_code)
                .map((sub: any) => sub.subscription_code);

            if (activeSubscriptionCodes.length === 0) {
                console.warn(`No active subscriptions found for customer ${customerCode}`);
                return null;
            }

            for (const subscriptionCode of activeSubscriptionCodes) {
                try {
                    const activeSubscription = await this.getSubscription(subscriptionCode);

                    if (!planId) {
                        return activeSubscription;
                    }

                    if (activeSubscription.plan.plan_code === planId.toString()) {
                        return activeSubscription;
                    }
                } catch (subscriptionError) {
                    console.warn(`Failed to fetch subscription details for code ${subscriptionCode}:`, subscriptionError);
                    continue;
                }
            }

            if (planId) {
                console.warn(`No active subscriptions found for customer ${customerCode} with plan ${planId}`);
            }

            return null;
        } catch (error) {
            console.error(`Error retrieving subscriptions for customer ${customerCode}:`, error);
            return null;
        }
    }

    async getSubscription(subscriptionCode: string): Promise<PaystackSubscription> {
        console.log('Getting Subscription:', subscriptionCode);
        try {
            const response = await this.axiosInstance.get<PaystackResponse<PaystackSubscription>>(
                `/subscription/${subscriptionCode}`
            );

            if (!response.data.status) {
                console.error('Failed to fetch subscription:', response.data.message);
                throw new Error('Failed to fetch subscription');
            }

            return response.data.data;
        } catch (error) {
            console.error('Error fetching subscription:', error);
            throw error;
        }
    }

    async cancelSubscription(subscriptionCode: string, userId: string, encryptedToken: string) {
        console.log('Cancelling Subscription:', { subscriptionCode, userId });
        try {
            const response = await this.axiosInstance.post('/subscription/disable', {
                code: subscriptionCode,
                token: decryptString(encryptedToken)
            });

            if (!response.data.status) {
                console.error('Failed to cancel subscription:', response.data.message);
                throw new Error('Failed to cancel subscription');
            }

            const { error: updateError } = await supabase
                .from('profile')
                .update({
                    subscriptionStatus: 'CANCELLED' as SubscriptionStatus,
                    cancelAtPeriodEnd: true,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', userId);

            if (updateError) {
                console.error('Failed to update profile:', updateError);
                throw updateError;
            }

            return true;
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            throw error;
        }
    }

    async generateCardUpdateLink(subscriptionCode: string) {
        console.log('Generating Card Update Link:', subscriptionCode);
        try {
            const response = await this.axiosInstance.get(
                `/subscription/${subscriptionCode}/manage/link/`
            );

            if (!response.data.status) {
                console.error('Failed to generate update link:', response.data.message);
                throw new Error('Failed to generate update link');
            }

            return response.data.data.link;
        } catch (error) {
            console.error('Error generating card update link:', error);
            throw error;
        }
    }

    async handleWebhook(event: any) {
        console.log('Handling Webhook:', event.event);
        try {
            switch (event.event) {
                case 'charge.success':
                    await this.handleChargeSuccess(event.data);
                    break;
                case 'subscription.create':
                    await this.handleSubscriptionCreate(event.data);
                    break;
                case 'subscription.disable':
                    await this.handleSubscriptionDisable(event.data);
                    break;
                case 'subscription.not_renew':
                    await this.handleSubscriptionNotRenew(event.data);
                    break;
                case 'invoice.payment_failed':
                    await this.handlePaymentFailed(event.data);
                    break;
                default:
                    console.log(`Unhandled webhook event: ${event.event}`);
            }
        } catch (error) {
            console.error('Error processing webhook:', error);
            throw error;
        }
    }

    private async handleChargeSuccess(data: any) {
        console.log('Handling Charge Success:', data);
        const { customer, metadata } = data;

        if (!metadata?.userId) return;

        try {

            const { data: existingProfile } = await supabase
                .from('profile')
                .select('id')
                .eq('id', metadata.userId)
                .single();

            if (!existingProfile) {
                const { error: insertError } = await supabase
                    .from('profile')
                    .insert([{
                        id: metadata.userId,
                        subscriptionStatus: 'ACTIVE',
                        paystackCustomerId: customer.customer_code,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }]);

                if (insertError) {
                    console.error('Error creating profile:', insertError);
                    throw insertError;
                }
            } else {
                const { error: updateError } = await supabase
                    .from('profile')
                    .update({
                        subscriptionStatus: 'ACTIVE',
                        paystackCustomerId: customer.customer_code,
                        updatedAt: new Date().toISOString()
                    })
                    .eq('id', metadata.userId);

                if (updateError) {
                    console.error('Error updating profile:', updateError);
                    throw updateError;
                }
            }
        } catch (error) {
            console.error('Error in handleChargeSuccess:', error);
            throw error;
        }
    }

    private async handleSubscriptionCreate(data: any) {
        console.log('Handling Subscription Create:', data);
        const { customer, subscription_code, next_payment_date } = data;

        if (!customer?.metadata?.userId) {
            console.error('No userId found in customer metadata');
            return;
        }

        try {
            const { data: existingProfile, error: fetchError } = await supabase
                .from('profile')
                .select('id')
                .eq('id', customer.metadata.userId)
                .single();

            if (fetchError) {
                console.error('Error fetching profile:', fetchError);
                throw fetchError;
            }

            if (!existingProfile) {
                console.error('No profile found for user:', customer.metadata.userId);
                return;
            }

            const { error: updateError } = await supabase
                .from('profile')
                .update({
                    subscriptionStatus: 'ACTIVE',
                    subscriptionCode: subscription_code,
                    encryptedToken: encryptString(subscription_code),
                    currentPeriodEnd: next_payment_date ? new Date(next_payment_date) : null,
                    paystackCustomerId: customer.customer_code,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', customer.metadata.userId);

            if (updateError) {
                console.error('Error updating profile:', updateError);
                throw updateError;
            }

            console.log('Successfully updated subscription for user:', customer.metadata.userId);
        } catch (error) {
            console.error('Error in handleSubscriptionCreate:', error);
            throw error;
        }
    }

    private async handleSubscriptionNotRenew(data: any) {
        const { customer, next_payment_date } = data;

        if (!customer?.metadata?.userId) return;

        try {
            const { error: updateError } = await supabase
                .from('profile')
                .update({
                    cancelAtPeriodEnd: true,
                    currentPeriodEnd: next_payment_date ? new Date(next_payment_date) : null, updatedAt: new Date().toISOString()
                })
                .eq('id', customer.metadata.userId);

            if (updateError) {
                console.error('Error updating profile:', updateError);
                throw updateError;
            }
        } catch (error) {
            console.error('Error in handleSubscriptionNotRenew:', error);
            throw error;
        }
    }

    private async handleSubscriptionDisable(data: any) {
        console.log('Handling Subscription Disable:', data);
        const { customer } = data;

        if (!customer?.metadata?.userId) return;

        try {
            const { error: updateError } = await supabase
                .from('profile')
                .update({
                    subscriptionStatus: 'CANCELLED',
                    currentPeriodEnd: null,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', customer.metadata.userId);

            if (updateError) {
                console.error('Error updating profile:', updateError);
                throw updateError;
            }
        } catch (error) {
            console.error('Error in handleSubscriptionDisable:', error);
            throw error;
        }
    }

    private async handlePaymentFailed(data: any) {
        console.log('Handling Payment Failed:', data);
        const { customer } = data;

        if (!customer?.metadata?.userId) return;

        try {
            const { error: updateError } = await supabase
                .from('profile')
                .update({
                    subscriptionStatus: 'PAST_DUE',
                    updatedAt: new Date().toISOString()
                })
                .eq('id', customer.metadata.userId);

            if (updateError) {
                console.error('Error updating profile:', updateError);
                throw updateError;
            }
        } catch (error) {
            console.error('Error in handlePaymentFailed:', error);
            throw error;
        }
    }
}