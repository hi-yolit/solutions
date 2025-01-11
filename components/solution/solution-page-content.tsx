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
}: SolutionPageContentProps) {
  const [activeTab, setActiveTab] = useState<string>('main')

  return (
    <div className="space-y-8">
      {/* TODO */}
      {/* An expladable bread crum */}
      {/* 2024 / Q1 / 1.1 / 1.1.1 => Q1 and 1.1. you can navigate tp nat oter uwatrions*/}
      {/* Each and every question its an accordin with a solution, opening one clappases and opsn others */}
      <p>Bread Crum</p>
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