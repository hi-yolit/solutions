'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  getPlans,
  getCurrentSubscription,
  initializeSubscription,
  updateSubscriptionPlan,
  cancelCurrentSubscription,
  getUpdateCardLink
} from '@/actions/subscription'
import { ProfileWithMetadata } from '@/types/user'
import { PaystackPlan, PaystackSubscription } from '@/utils/paystack'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { parsePlanDescription } from '@/lib/utils'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { CreditCard, Loader2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

interface SubscriptionManagementProps {
  profile: ProfileWithMetadata
}

export function SubscriptionManagement({ profile }: Readonly<SubscriptionManagementProps>) {
  const [availablePlans, setAvailablePlans] = useState<PaystackPlan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<PaystackSubscription | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [isUpdatingCard, setIsUpdatingCard] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchSubscriptionDetails() {
      try {
        const plans = await getPlans()
        const filteredPlans = plans.filter((plan: PaystackPlan) => {
          const description = parsePlanDescription(plan.description)
          return !description?.disabled
        })

        setAvailablePlans(filteredPlans)

        if (profile.subscriptionCode) {
          const subscription = await getCurrentSubscription(profile.id)
          setCurrentSubscription(subscription)
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load subscription details',
          variant: 'destructive'
        })
      }
    }

    fetchSubscriptionDetails()
  }, [profile.id, profile.subscriptionCode])

  const handleUpdateCard = async () => {
    try {
      setIsUpdatingCard(true)
      const { url } = await getUpdateCardLink()
      router.push(url)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate card update link',
        variant: 'destructive'
      })
    } finally {
      setIsUpdatingCard(false)
    }
  }

  // Show free trial/credits info if no subscription
  if (!profile.subscriptionCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Free Trial Status</span>
            {profile.solutionCredits > 0 ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
          </CardTitle>
          <CardDescription>
            {profile.solutionCredits > 0
              ? `You have ${profile.solutionCredits} solution credits remaining`
              : 'Your free trial has ended'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-primary/5 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2">Why Subscribe?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Unlimited access to all solutions</li>
              <li>• Detailed step-by-step explanations</li>
              <li>• Premium learning resources</li>
              <li>• Cancel anytime</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">Choose a Plan</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select a Subscription Plan</DialogTitle>
                <DialogDescription>
                  Choose a plan to continue using our services
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Select
                  value={selectedPlan}
                  onValueChange={setSelectedPlan}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlans.map(availPlan => {
                      const planDetails = parsePlanDescription(availPlan.description)
                      return (
                        <SelectItem
                          key={availPlan.plan_code}
                          value={availPlan.plan_code}
                        >
                          <span className="flex flex-col">
                            <span>{availPlan.name} - {availPlan.amount / 100} ZAR per {availPlan.interval}</span>
                            {planDetails?.comparisonNote && (
                              <span className="text-xs text-muted-foreground">
                                {planDetails.comparisonNote}
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  onClick={async () => {
                    if (!selectedPlan) {
                      toast({ description: 'Please select a plan' })
                      return
                    }

                    setLoading(true)
                    try {
                      const { authorizationUrl } = await initializeSubscription(selectedPlan)
                      router.push(authorizationUrl)
                    } catch (error) {
                      toast({
                        title: 'Error',
                        description: 'Failed to initialize subscription',
                        variant: 'destructive'
                      })
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={!selectedPlan || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    )
  }

  // If subscription exists but we couldn't fetch details
  if (!currentSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading subscription details...
            </div>
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Details</CardTitle>
        <CardDescription>
          Manage your subscription and billing information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium">Current Plan</div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{currentSubscription.plan?.name}</span> - <span>
                {currentSubscription.plan ? `${currentSubscription.plan.amount / 100} ZAR per ${currentSubscription.plan.interval}` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Status</div>
            <div className="flex items-center gap-2">
              {currentSubscription?.status === 'active' ? (
                <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Active
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {currentSubscription?.status || 'Unknown'}
                </div>
              )}
            </div>
          </div>
        </div>

        {currentSubscription?.next_payment_date && (
          <div>
            <div className="text-sm font-medium mb-1">Next billing date</div>
            <div>
              {new Date(currentSubscription.next_payment_date).toLocaleDateString()}
            </div>
          </div>
        )}

        <Separator />

        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleUpdateCard}
            disabled={isUpdatingCard}
          >
            {isUpdatingCard ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Update Payment Method
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Change Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select a New Plan</DialogTitle>
                <DialogDescription>
                  Choose a new subscription plan
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Select
                  value={selectedPlan}
                  onValueChange={setSelectedPlan}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a new plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlans.map(availPlan => {
                      const planDetails = parsePlanDescription(availPlan.description)
                      return (
                        <SelectItem
                          key={availPlan.plan_code}
                          value={availPlan.plan_code}
                          disabled={currentSubscription?.plan?.plan_code === availPlan.plan_code}
                        >
                          <span className="flex flex-col">
                            <span>{availPlan.name} - {availPlan.amount / 100} ZAR per {availPlan.interval}</span>
                            {planDetails?.comparisonNote && (
                              <span className="text-xs text-muted-foreground">
                                {planDetails.comparisonNote}
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  onClick={async () => {
                    if (!selectedPlan || !currentSubscription?.subscription_code) {
                      toast({ description: 'Please select a plan' })
                      return
                    }

                    setLoading(true)
                    try {
                      const { authorizationUrl } = await updateSubscriptionPlan(
                        currentSubscription.subscription_code,
                        selectedPlan
                      )
                      router.push(authorizationUrl)
                    } catch (error) {
                      toast({
                        title: 'Error',
                        description: 'Failed to change plan',
                        variant: 'destructive'
                      })
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={!selectedPlan || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    'Change Plan'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch sm:flex-row sm:justify-between sm:items-center gap-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={profile.cancelAtPeriodEnd === true}
              className="w-full sm:w-auto"
            >
              {profile.cancelAtPeriodEnd
                ? 'Cancellation Scheduled'
                : 'Cancel Subscription'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Your subscription will be cancelled at the end of the current billing period. 
                You will lose access to all premium features once your subscription ends.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  try {
                    await cancelCurrentSubscription()
                    router.refresh()
                    toast({ description: 'Subscription cancelled successfully' })
                  } catch (error) {
                    toast({
                      title: 'Error',
                      description: 'Failed to cancel subscription',
                      variant: 'destructive'
                    })
                  }
                }}
              >
                Yes, Cancel Subscription
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}