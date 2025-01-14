// components/solution/solution-viewer.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useAuth } from '@/contexts/auth-context'
import { isSubscriptionValid } from '@/actions/subscription'
import Link from 'next/link'
import {
  SolutionContent,
  SubQuestionSolution,
  MCQSolution,
  StructuredStep,
  EssayOutlinePoint,
  ProofStep
} from '@/types/solution'
import { MCQSolutionView } from './mcq-solution'
import { StructuredSolutionView } from './structured-solution'
import { EssaySolutionView } from './essay-solution'
import { ProofSolutionView } from './proof-solution'

interface SolutionViewerProps {
  activeTab: string
  onTabChange: (tab: string) => void
  mainSolution?: SolutionContent
  subSolutions?: SubQuestionSolution[]
}

function AuthRequiredCard() {
  return (
    <Card className="relative overflow-hidden border border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardContent className="p-8 text-center space-y-6 relative z-20">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight">Login Required</h3>
          <p className="text-muted-foreground text-sm">
            Sign in to your account to access detailed step-by-step solutions and improve your understanding.
          </p>
        </div>
        <div>
          <Button asChild className="relative bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/auth/login">Sign In to Continue</Link>
          </Button>
        </div>
      </CardContent>
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
    </Card>
  )
}

function SubscriptionRequiredCard() {
  return (
    <Card className="relative overflow-hidden border border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardContent className="p-8 text-center space-y-6 relative z-20">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight">Premium Access Required</h3>
          <p className="text-muted-foreground text-sm">
            Subscribe to unlock unlimited access to solutions, step-by-step explanations, and more premium features.
          </p>
        </div>
        <div>
          <Button asChild className="relative bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/pricing">View Subscription Plans</Link>
          </Button>
        </div>
      </CardContent>
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
    </Card>
  )
}

export function SolutionViewer({
  activeTab,
  onTabChange,
  mainSolution,
  subSolutions = []
}: Readonly<SolutionViewerProps>) {
  const { user } = useAuth()

  // Initialize all state hooks at the top
  const [hasValidSubscription, setHasValidSubscription] = useState<boolean | null>(null)
  const [initialTabSet, setInitialTabSet] = useState(false)
  const [revealedSteps, setRevealedSteps] = useState<Record<string, number[]>>(() => ({
    main: [],
    ...Object.fromEntries(subSolutions?.map(sub => [sub.part, []]) || [])
  }))
  const [showingHint, setShowingHint] = useState<Record<string, number | null>>(() => ({
    main: null,
    ...Object.fromEntries(subSolutions?.map(sub => [sub.part, null]) || [])
  }))

  // Set initial tab if needed
  useEffect(() => {
    if (!initialTabSet && !mainSolution && subSolutions?.length > 0) {
      onTabChange(subSolutions[0].part)
      setInitialTabSet(true)
    }
  }, [mainSolution, subSolutions, initialTabSet, onTabChange])

  // Check subscription validity
  useEffect(() => {
    async function checkSubscription() {
      if (user?.id) {
        const isValid = await isSubscriptionValid(user.id)
        setHasValidSubscription(isValid)
      } else {
        setHasValidSubscription(false)
      }
    }
    checkSubscription()
  }, [user])

  // Early returns for auth and subscription checks
  if (!user) {
    return <AuthRequiredCard />
  }

  if (hasValidSubscription === false) {
    return <SubscriptionRequiredCard />
  }

  // Helper functions for managing steps and hints
  const revealStep = (tabKey: string, stepIndex: number) => {
    setRevealedSteps(prev => ({
      ...prev,
      [tabKey]: [...new Set([...prev[tabKey], stepIndex])].sort((a, b) => (a - b))
    }))
  }

  const handleShowHint = (tabKey: string, index: number) => {
    setShowingHint(prev => ({
      ...prev,
      [tabKey]: prev[tabKey] === index ? null : index
    }))
  }

  const renderSolutionContent = (solution: SolutionContent, tabKey: string) => {
    if (!solution) return null;

    switch (solution.type) {
      case 'MCQ':
        return (
          <MCQSolutionView
            solution={solution.content as MCQSolution}
          />
        )
      case 'STRUCTURED':
        return (
          <StructuredSolutionView
            steps={solution.content as StructuredStep[]}
            revealedSteps={revealedSteps[tabKey] || []}
            onReveal={(index) => revealStep(tabKey, index)}
            showingHint={showingHint?.[tabKey]}
            onShowHint={(index) => handleShowHint(tabKey, index)}
          />
        )
      case 'ESSAY':
        return (
          <EssaySolutionView
            points={solution.content as EssayOutlinePoint[]}
            revealed={revealedSteps[tabKey]?.includes(0) || false}
            onReveal={() => revealStep(tabKey, 0)}
          />
        )
      case 'PROOF':
        return (
          <ProofSolutionView
            steps={solution.content as ProofStep[]}
            revealed={revealedSteps[tabKey]?.includes(0) || false}
            onReveal={() => revealStep(tabKey, 0)}
          />
        )
      default:
        return null
    }
  }

  const getStepCount = (tabKey: string): number => {
    const solution = tabKey === 'main'
      ? mainSolution
      : subSolutions.find(s => s.part === tabKey)?.solution

    if (!solution) return 0

    if (solution.type === 'STRUCTURED') {
      return (solution.content as StructuredStep[])?.length || 0
    }

    return 1
  }

  const getCurrentProgress = () => {
    const current = revealedSteps[activeTab]?.length || 0
    const total = getStepCount(activeTab)
    return { current, total }
  }

  if (!mainSolution && (!subSolutions || subSolutions.length === 0)) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          No solution available
        </CardContent>
      </Card>
    )
  }

  const { current, total } = getCurrentProgress()

  return (
    <div className="space-y-6">
      <Progress value={(current / total) * 100} className="h-2" />

      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList>
          {mainSolution && (
            <TabsTrigger value="main">Main Solution</TabsTrigger>
          )}
          {subSolutions.map((sub) => (
            <TabsTrigger key={sub.part} value={sub.part}>
              Part {sub.part}
            </TabsTrigger>
          ))}
        </TabsList>

        {mainSolution && (
          <TabsContent value="main" className="mt-6">
            {renderSolutionContent(mainSolution, 'main')}
          </TabsContent>
        )}

        {subSolutions.map((sub) => (
          <TabsContent key={sub.part} value={sub.part} className="mt-6">
            {renderSolutionContent(sub.solution, sub.part)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}