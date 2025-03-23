// app/questions/[questionId]/page.tsx
import { getQuestionWithSolutions } from '@/actions/solutions'
import { SolutionPageContent } from '@/components/solution/solution-page-content'

interface PageProps {
  params: Promise<{
    questionId: string
  }>
}

export default async function QuestionPage({ params }: Readonly<PageProps>) {
  const resolvedParams = await params;
  const { question, error } = await getQuestionWithSolutions(resolvedParams.questionId)

  if (error || !question) {
    return <div>Failed to load question</div>
  }

  const content = question.content
  
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