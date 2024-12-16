// src/app/solutions/[solutionId]/page.tsx
'use client'

import { useState } from 'react'
import { QuestionCard } from '@/components/solution/question-card'
import { ProgressBar } from '@/components/solution/progress-bar'
import { SolutionStepCard } from '@/components/solution/solution-step'
import { ActionBar } from '@/components/solution/action-bar'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SolutionData } from '@/types/solution'

const solutionData: SolutionData = {
  id: '1',
  question: {
    number: '1.1',
    content: 'Find the nth term of the arithmetic sequence: 3, 7, 11, 15, ...',
    marks: 4,
    type: 'STRUCTURED',
    subject: 'Mathematics',
    chapter: 'Sequences and Series',
    resource: 'Mind Action Series Grade 12'
  },
  solution: {
    steps: [
      {
        number: 1,
        title: 'Identify the arithmetic sequence pattern',
        hint: 'Look at the difference between consecutive terms',
        content: 'Find the common difference (d) between consecutive terms:',
        explanation: '7 - 3 = 4\n11 - 7 = 4\n15 - 11 = 4\nTherefore, d = 4',
        tip: 'In an arithmetic sequence, the difference between consecutive terms is constant.'
      },
      {
        number: 2,
        title: 'Use the arithmetic sequence formula',
        hint: 'Use the formula: Tn = a + (n-1)d',
        content: 'The nth term (Tn) formula is: Tn = a + (n-1)d',
        explanation: 'Where:\na = first term = 3\nd = common difference = 4\n\nTherefore:\nTn = 3 + (n-1)4\nTn = 3 + 4n - 4\nTn = 4n - 1',
        tip: 'Remember to simplify your expression to its simplest form.'
      }
    ],
    finalAnswer: 'Tn = 4n - 1',
    expertNotes: 'This is a straightforward application of the arithmetic sequence formula.'
  },
  expert: {
    name: 'Dr. Sarah Johnson',
    verified: true,
    rating: 4.8
  },
  metrics: {
    helpfulVotes: 156,
    views: 1240
  }
}

export default function SolutionPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [revealedSteps, setRevealedSteps] = useState<number[]>([]);
  const [showingHint, setShowingHint] = useState<number | null>(null);
  
  const totalSteps = solutionData.solution.steps.length;

  const revealStep = (stepNumber: number) => {
    if (!revealedSteps.includes(stepNumber)) {
      setRevealedSteps([...revealedSteps, stepNumber]);
    }
    setCurrentStep(stepNumber);
  };

  const isStepRevealed = (stepNumber: number) => {
    return revealedSteps.includes(stepNumber);
  };

  const revealFinalAnswer = () => {
    setRevealedSteps([...Array(totalSteps + 1).keys()]);
    setCurrentStep(totalSteps);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <QuestionCard question={solutionData.question} />
      
      <ProgressBar 
        current={revealedSteps.length}
        total={totalSteps + 1}
      />

      <div className="space-y-6">
        {solutionData.solution.steps.map((step, index) => (
          <SolutionStepCard
            key={step.number}
            step={step}
            isRevealed={isStepRevealed(index)}
            showingHint={showingHint === index}
            onReveal={() => revealStep(index)}
            onShowHint={() => setShowingHint(index)}
          />
        ))}

        {/* Final Answer Card */}
        <Card className={!isStepRevealed(totalSteps) ? 'opacity-60' : ''}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Final Answer</CardTitle>
              {!isStepRevealed(totalSteps) && (
                <Button onClick={revealFinalAnswer}>
                  Reveal Answer
                </Button>
              )}
            </div>
          </CardHeader>
          {isStepRevealed(totalSteps) && (
            <CardContent>
              <div className="bg-green-50 p-4 rounded-md">
                <p className="font-semibold text-green-800">
                  {solutionData.solution.finalAnswer}
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Expert Notes */}
        {isStepRevealed(totalSteps) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expert Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{solutionData.solution.expertNotes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <ActionBar />
    </div>
  )
}