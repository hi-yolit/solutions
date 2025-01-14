import { createPayStackClient } from '@/utils/paystack/paystack'

export const paystack = new createPayStackClient(
    process.env.PAYSTACK_SECRET_KEY! || ''
)

export * from './types'