// components/solution/solution-viewer.tsx
"use client"

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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

export function SolutionViewer({
    activeTab,
    onTabChange,
    mainSolution,
    subSolutions
  }: SolutionViewerProps) {
    const [revealedSteps, setRevealedSteps] = useState<Record<string, number[]>>({
      main: [],
      ...Object.fromEntries(
        subSolutions?.map(sub => [sub.part, []]) || []
      )
    })
  
    // Add the showingHint state
    const [showingHint, setShowingHint] = useState<Record<string, number | null>>({
      main: null,
      ...Object.fromEntries(
        subSolutions?.map(sub => [sub.part, null]) || []
      )
    })
  
    const revealStep = (tabKey: string, stepIndex: number) => {
      setRevealedSteps(prev => ({
        ...prev,
        [tabKey]: [...new Set([...prev[tabKey], stepIndex])].sort()
      }))
    }
  
    // Add the handleShowHint function
    const handleShowHint = (tabKey: string, index: number) => {
      setShowingHint(prev => ({
        ...prev,
        [tabKey]: prev[tabKey] === index ? null : index
      }))
    }

  const renderSolutionContent = (solution: SolutionContent, tabKey: string) => {
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
              revealedSteps={revealedSteps[tabKey]}
              onReveal={(index) => revealStep(tabKey, index)}
              showingHint={showingHint?.[tabKey]}
              onShowHint={(index) => handleShowHint?.(tabKey, index)}
            />
        )
      case 'ESSAY':
        return (
          <EssaySolutionView
            points={solution.content as EssayOutlinePoint[]}
            revealed={revealedSteps[tabKey].includes(0)}
            onReveal={() => revealStep(tabKey, 0)}
          />
        )
      case 'PROOF':
        return (
          <ProofSolutionView
            steps={solution.content as ProofStep[]}
            revealed={revealedSteps[tabKey].includes(0)}
            onReveal={() => revealStep(tabKey, 0)}
          />
        )
    }
  }

  const getCurrentProgress = () => {
    const current = revealedSteps[activeTab].length
    const total = getStepCount(activeTab)
    return { current, total }
  }

  const getStepCount = (tabKey: string) => {
    const solution = tabKey === 'main' 
      ? mainSolution 
      : subSolutions?.find(s => s.part === tabKey)?.solution

    if (!solution) return 0

    switch (solution.type) {
      case 'STRUCTURED':
        return (solution.content as StructuredStep[]).length
      default:
        return 1
    }
  }

  if (!mainSolution && !subSolutions?.length) {
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
          {subSolutions?.map((sub) => (
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

        {subSolutions?.map((sub) => (
          <TabsContent key={sub.part} value={sub.part} className="mt-6">
            {renderSolutionContent(sub.solution, sub.part)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}