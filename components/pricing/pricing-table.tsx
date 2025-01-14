"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { cn, parsePlanDescription } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { toast } from '@/hooks/use-toast'
import { PaystackPlan, PaystackSubscription, PlanDescription } from '@/utils/paystack'
import { useEffect, useState } from 'react'



interface PricingTableProps {
    initialPlans: PaystackPlan[]
    initializeSubscription: (planCode: string) => Promise<{
        authorizationUrl: string
        reference: string
    }>
    getCurrentSubscription: (userId: string) => Promise<PaystackSubscription | null>
}

export function PricingTable({
    initialPlans,
    initializeSubscription,
    getCurrentSubscription
}: PricingTableProps) {
    const router = useRouter()
    const { profile } = useAuth()
    const [currentSubscription, setCurrentSubscription] = useState<PaystackSubscription | null>(null)

    useEffect(() => {
        async function fetchCurrentSubscription() {
            if (profile?.id) {
                try {
                    const subscription = await getCurrentSubscription(profile.id)
                    setCurrentSubscription(subscription)
                } catch (error) {
                    console.error('Error fetching current subscription:', error)
                }
            }
        }

        fetchCurrentSubscription()
    }, [profile?.id, getCurrentSubscription])

    const formatInterval = (interval: string) => {
        switch (interval) {
            case 'monthly':
                return '/month'
            case 'yearly':
            case 'annually':
                return '/year'
            case 'hourly':
                return '/hour'
            default:
                return `/${interval}`
        }
    }

    const handleSubscribe = async (planCode: string) => {
        try {
            if (profile?.role === 'ADMIN') {
                toast({ description: 'Admins do not need subscriptions' })
                return
            }

            const { authorizationUrl } = await initializeSubscription(planCode)
            router.push(authorizationUrl)
        } catch (error) {
            console.error('Subscription error:', error)
            toast({ description: error instanceof Error ? error.message : 'Failed to start subscription' })
        }
    }
    

    // Arrange plans with the popular plan in the middle
    const arrangedPlans = (() => {
        // Parse descriptions and find the popular plan
        const plansWithDetails = initialPlans.map(plan => ({
            ...plan,
            details: parsePlanDescription(plan.description)
        }))

        // Ensure exactly 3 plans
        if (plansWithDetails.length !== 3) {
            return plansWithDetails
                .sort((a, b) => {
                    // Sort by explicit order if available
                    const orderA = parsePlanDescription(a.description)?.order ?? Infinity
                    const orderB = parsePlanDescription(b.description)?.order ?? Infinity
                    return orderA - orderB
                })
                .slice(0, 3)
        }

        // Find the popular plan
        const popularPlanIndex = plansWithDetails.findIndex(plan => plan.details?.popular)

        // If no popular plan, sort by order
        if (popularPlanIndex === -1) {
            return plansWithDetails
                .sort((a, b) => {
                    const orderA = parsePlanDescription(a.description)?.order ?? Infinity
                    const orderB = parsePlanDescription(b.description)?.order ?? Infinity
                    return orderA - orderB
                })
        }

        // Create a copy of the plans
        const result = [...plansWithDetails]

        // If popular plan is not in the middle, put it in the middle
        if (popularPlanIndex !== 1) {
            // Remove the popular plan
            const popularPlan = result.splice(popularPlanIndex, 1)[0]

            // Insert the popular plan in the middle
            result.splice(1, 0, popularPlan)
        }

        // Sort first and last slots by order
        const firstAndLastPlans = [result[0], result[2]].sort((a, b) => {
            const orderA = parsePlanDescription(a.description)?.order ?? Infinity
            const orderB = parsePlanDescription(b.description)?.order ?? Infinity
            return orderA - orderB
        })

        // Replace first and last plans with sorted versions
        result[0] = firstAndLastPlans[0]
        result[2] = firstAndLastPlans[1]

        return result
    })()

    if (arrangedPlans.length !== 3) {
        return (
            <div className="text-center py-8">
                <h2 className="text-xl font-semibold">Pricing Plans Unavailable</h2>
                <p className="text-muted-foreground mt-2">
                    Please ensure exactly 3 pricing plans are configured.
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-3 gap-6">
            {arrangedPlans.map((plan, index) => {
                const planDetails = plan.details
                const isCurrentPlan = currentSubscription 
                    ? currentSubscription.plan.plan_code === plan.plan_code
                    : false

                return (
                    <Card
                        key={plan.plan_code}
                        className={cn(
                            "relative w-full transition-all duration-300",
                            index === 1 && "border-primary border-2 scale-105", // Middle card
                            (planDetails?.disabled || (currentSubscription && !isCurrentPlan)) && "opacity-70 grayscale-[50%]"
                        )}
                    >
                        {index === 1 && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                                <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full shadow-md">
                                    Most Popular
                                </span>
                            </div>
                        )}

                        <CardHeader>
                            <CardTitle className="flex flex-col gap-2">
                                <span>{plan.name}</span>
                                <span className="text-3xl font-bold">
                                    {planDetails?.disabled ? (
                                        <>~R{(plan.amount / 100).toFixed(0)}</>
                                    ) : (
                                        <>R{(plan.amount / 100).toFixed(0)}</>
                                    )}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        {formatInterval(plan.interval)}
                                    </span>
                                </span>
                            </CardTitle>
                            {planDetails?.billingNote && (
                                <p className="text-sm text-emerald-600 mt-1">
                                    {planDetails.billingNote}
                                </p>
                            )}
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Features List */}
                            {planDetails?.features && (
                                <ul className="space-y-3">
                                    {planDetails.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Comparison Note */}
                            {planDetails?.comparisonNote && (
                                <p className="text-sm text-muted-foreground mt-2 italic">
                                    {planDetails.comparisonNote}
                                </p>
                            )}

                            {/* Action Button */}
                            {planDetails && !planDetails?.disabled && (
                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        if (currentSubscription) {
                                            if (isCurrentPlan) {
                                                router.push('/account')
                                            } else {
                                                toast({ 
                                                    description: 'You are currently on a different plan. Manage your subscription in Account Settings.' 
                                                })
                                            }
                                        } else {
                                            handleSubscribe(plan.plan_code)
                                        }
                                    }}disabled={
                                        profile?.role === 'ADMIN' || 
                                        !!(currentSubscription && !isCurrentPlan)
                                    }
                                    variant={index === 1 ? "default" : "outline"}
                                >
                                    {currentSubscription 
                                        ? (isCurrentPlan 
                                            ? 'Manage Account' 
                                            : 'Current Plan') 
                                        : (profile?.role === 'ADMIN'
                                            ? 'Admin Account'
                                            : 'Get Started')
                                    }
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}