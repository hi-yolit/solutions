// app/questions/[questionId]/page.tsx
import { getQuestionWithSolutions } from '@/actions/solutions'
import { SolutionPageContent } from '@/components/solution/solution-page-content'
import type { SolutionData, QuestionContent } from '@/types/solution'

interface PageProps {
  params: {
    questionId: string
  }
}

export default async function QuestionPage({ params }: PageProps) {
  const { question, error } = await getQuestionWithSolutions(params.questionId)

  if (error || !question) {
    return <div>Failed to load question</div>
  }

  const content = question.content as QuestionContent
  
  // Keep the same transformation as admin
  const solution = question.solutions[0] ? {
    id: question.solutions[0].id,
    questionId: question.id,
    mainSolution: (question.solutions[0].content as any).mainSolution,
    subSolutions: (question.solutions[0].content as any).subSolutions?.map((sub: any) => ({
      part: sub.part,
      solution: sub.solution
    }))
  } : undefined

  return (
    <SolutionPageContent 
      questionContent={content}
      solution={solution}
    />
  )
}