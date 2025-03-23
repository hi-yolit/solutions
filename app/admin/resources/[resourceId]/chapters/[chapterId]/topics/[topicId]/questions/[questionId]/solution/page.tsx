// app/admin/resources/[resourceId]/chapters/[chapterId]/questions/[questionId]/solution/page.tsx
import { getQuestionWithSolutions } from '@/actions/solutions'
import { SolutionWrapper } from '@/components/admin/solutions/solution-wrapper'
import { SolutionData, QuestionContent, SolutionContent } from '@/types/solution'

export default async function QuestionSolutionPage({
  params
}: Readonly<{
  params: Promise<{ 
    resourceId: string; 
    chapterId: string; 
    questionId: string;
    topicId?: string;
  }>
}>) {
  const resolvedParams = await params;
  const { question, error } = await getQuestionWithSolutions(resolvedParams.questionId)

  if (error || !question) {
    return <div>Failed to load question</div>
  }

  const content = question.content as QuestionContent
  
  // Transform the solution data
  const existingSolution = question.solutions[0] ? {
    id: question.solutions[0].id,
    questionId: question.id,
    mainSolution: (question.solutions[0].content as any).mainSolution as SolutionContent,
    subSolutions: (question.solutions[0].content as any).subSolutions?.map((sub: any) => ({
      part: sub.part,
      solution: sub.solution as SolutionContent
    }))
  } : undefined

  return (
    <SolutionWrapper
      questionId={question.id}
      resourceId={resolvedParams.resourceId}
      chapterId={resolvedParams.chapterId}
      topicId={resolvedParams.topicId}
      questionType={question.type}
      questionContent={content.mainQuestion}
      subQuestions={content.subQuestions}
      marks={content.marks}
      existingSolution={existingSolution}
    />
  )
}