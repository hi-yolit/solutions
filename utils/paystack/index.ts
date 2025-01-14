import { CreatePayStackClient } from '@/utils/paystack/paystack'

export const paystack = new CreatePayStackClient(
    process.env.PAYSTACK_SECRET_KEY! || ''
)

export * from './types'