
// app/pricing/page.tsx
import { Suspense } from 'react'
import { PricingTable } from '@/components/pricing/pricing-table'
import { getPlans, initializeSubscription, getCurrentSubscription  } from '@/actions/subscription'

export default async function PricingPage() {
  const plans = await getPlans()
  
  if (!plans?.length) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Plans Unavailable</h1>
          <p className="text-muted-foreground mt-2">
            Please try again later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Become a member</h1>
        <p className="text-muted-foreground mt-2">
        Invest in your education and get unlimited access to all solutions
        </p>
      </div>
      <Suspense fallback={<div>Loading plans...</div>}>
        <PricingTable 
          initialPlans={plans} 
          initializeSubscription={initializeSubscription}
          getCurrentSubscription={getCurrentSubscription}
        />
      </Suspense>
    </div>
  )
}