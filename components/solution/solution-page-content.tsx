// components/solution/solution-page-content.tsx
"use client"

import { useState } from 'react'
import { QuestionViewer } from '@/components/solution/question-viewer'
import { SolutionViewer } from '@/components/solution/solution-viewer'
import type { SolutionData, QuestionContent } from '@/types/solution'

interface SolutionPageContentProps {
  questionContent: QuestionContent
  solution?: SolutionData
}

export function SolutionPageContent({ 
  questionContent, 
  solution 
}: Readonly<SolutionPageContentProps>) {
  const [activeTab, setActiveTab] = useState<string>('main')

  return (
    <div className="space-y-8">
      <QuestionViewer 
        mainQuestion={questionContent.mainQuestion}
        marks={questionContent.marks}
        subQuestions={questionContent.subQuestions}
      />
      
      {solution && (
        <SolutionViewer
          activeTab={activeTab}
          onTabChange={setActiveTab}
          mainSolution={solution.mainSolution}
          subSolutions={solution.subSolutions}
        />
      )}
    </div>
  )
}