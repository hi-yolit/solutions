// app/actions/subscription.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { paystack, PaystackPlan, PaystackSubscription } from '@/utils/paystack'
import { getProfile } from './user'


export async function getPlans() {
  try {
    const plans = await paystack.listPlans()
    return plans
      .filter((plan: PaystackPlan) =>
        !plan.is_archived &&
        !plan.is_deleted &&
        plan.currency === 'ZAR'
      )
  } catch (error) {
    console.error('Error fetching plans:', error)
    throw error
  }
}

export async function getCurrentSubscription(userId: string): Promise<PaystackSubscription | null> {
  try {

    // Fetch the user's profile to get Paystack customer ID
    const { profile, error: profileError } = await getProfile(userId)

    if (profileError || !profile?.paystackCustomerId) {
      console.error('Profile not found or no customer ID', profileError)
      return null
    }

    // Get active subscription
    const subscription = await paystack.getCustomerActiveSubscription(
      profile.paystackCustomerId
    )

    if (!subscription) {
      return null
    }

    return subscription
  } catch (error) {
    console.error('Error fetching current subscription:', error)
    return null
  }
}

export async function initializeSubscription(planCode: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    // Get profile to check role and customer ID
    const { profile } = await getProfile(user.id)

    // Admin bypass
    if (profile?.role === 'ADMIN') {
      throw new Error('Admins do not need subscriptions')
    }

    let customerId = profile?.paystackCustomerId

    if (!customerId) {
      await paystack.createCustomer(user.id, user.email!)
    }

    return await paystack.initializeTransaction(
      user.email!,
      planCode,
      user.id
    )
  } catch (error) {
    console.error('Error creating subscription:', error)
    throw error
  }
}

export async function updateSubscriptionPlan(
  currentSubscriptionCode: string,
  newPlanCode: string
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    const { profile } = await getProfile(user.id)

    if (!profile?.encryptedToken) {
      throw new Error('No subscription token')
    }

    // First, cancel the current subscription
    await paystack.cancelSubscription(currentSubscriptionCode, user.id, profile.encryptedToken)

    // Then initialize a new transaction with the new plan
    const transaction = await initializeSubscription(newPlanCode)

    revalidatePath('/account')

    return transaction
  } catch (error) {
    console.error('Error updating subscription plan:', error)
    throw error
  }
}

export async function getUpdateCardLink() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    const { profile } = await getProfile(user.id)

    // Admin bypass
    if (profile?.role === 'ADMIN') {
      throw new Error('Admins do not need subscriptions')
    }

    if (!profile?.subscriptionCode) {
      throw new Error('No active subscription')
    }

    const link = await paystack.generateCardUpdateLink(profile.subscriptionCode)
    return { url: link }
  } catch (error) {
    console.error('Error generating update link:', error)
    throw error
  }
}

export async function cancelCurrentSubscription() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    const { profile } = await getProfile(user.id)

    // Admin bypass
    if (profile?.role === 'ADMIN') {
      throw new Error('Admins do not need subscriptions')
    }

    if (!profile?.subscriptionCode) {
      throw new Error('No active subscription')
    }

    if (!profile?.encryptedToken) {
      throw new Error('No active subscription')
    }

    await paystack.cancelSubscription(profile.subscriptionCode, user.id, profile.encryptedToken)

    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

export async function isSubscriptionValid(userId: string) {
  try {

    const { profile } = await getProfile(userId)

    if (!profile) return false

    // Admin bypass
    if (profile.role === 'ADMIN') {
      return true
    }

    // Check if user still has free credits
    if (profile.solutionCredits > 0) {
      return true
    }

    // Check if trial is still valid
    if (profile.trialEndsAt && new Date(profile.trialEndsAt) > new Date()) {
      return true
    }

    // Check if subscription is active and not expired
    return (
      profile.subscriptionStatus === 'ACTIVE' &&
      new Date(profile.currentPeriodEnd!) > new Date()
    )
  } catch (error) {
    console.error('Error checking subscription:', error)
    return false
  }
}