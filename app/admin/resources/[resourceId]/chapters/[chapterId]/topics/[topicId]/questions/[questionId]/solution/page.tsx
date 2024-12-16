"use client"

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { SolutionWrapper } from '@/components/admin/solutions/solution-wrapper'
import { QuestionType, SolutionData } from '@/types/solution'
import { mockApi } from '@/lib/mock-data'

interface Question {
  id: string;
  type: QuestionType;
  content: string;
  marks?: number;
}

export default function QuestionSolutionPage() {
  const params = useParams()
  const [question, setQuestion] = useState<Question | null>(null)
  const [existingSolution, setExistingSolution] = useState<SolutionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use mock API
        const questionData = await mockApi.getQuestion(params.questionId as string)
        setQuestion(questionData)

        const solutionData = await mockApi.getSolution(params.questionId as string)
        if (solutionData) {
          setExistingSolution(solutionData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.questionId])

  if (isLoading) return <div>Loading...</div>
  if (!question) return <div>Question not found</div>

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-5xl mx-auto">
        <SolutionWrapper
          questionId={params.questionId as string}
          resourceId={params.resourceId as string}
          chapterId={params.chapterId as string}
          topicId={params.topicId as string}
          questionType={question.type}
          questionContent={question.content}
          marks={question.marks}
          existingSolution={existingSolution ?? undefined}
        />
      </div>
    </div>
  )
}