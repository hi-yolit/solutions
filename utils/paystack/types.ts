export interface PaystackPlan {
    id: number;
    name: string;
    plan_code: string;
    description: string | null;
    amount: number;
    interval: string;
    currency: string;
    is_active: boolean;
    is_deleted: boolean;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

export interface PaystackSubscription {
    id: number;
    customer: {
        first_name: string | null;
        last_name: string | null;
        email: string;
        customer_code: string;
        phone: string | null;
    };
    plan: {
        id: number;
        name: string;
        plan_code: string;
        description: string | null;
        amount: number;
        interval: string;
        currency: string;
    };
    status: string;
    subscription_code: string;
    email_token: string;
    amount: number;
    next_payment_date: string;
    created_at: string;
}

export interface PaystackResponse<T> {
    status: boolean;
    message: string;
    data: T;
}

export interface PlanDescription {
    features?: string[]
    popular?: boolean
    billingNote?: string
    disabled?: boolean
    comparisonNote?: string
    order?: number
}
