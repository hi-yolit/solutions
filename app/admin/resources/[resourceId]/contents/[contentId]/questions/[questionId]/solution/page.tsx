// app/admin/resources/[resourceId]/contents/[contentId]/questions/[questionId]/solution/page.tsx
import { getQuestionWithSolutions } from '@/actions/solutions'
import { SolutionWrapper } from '@/components/admin/solutions/solution-wrapper'
import { SolutionData, SolutionContent } from '@/types/solution'

interface PageProps {
  params: Promise<{
    resourceId: string; 
    contentId: string; 
    questionId: string;
  }>;
}

export default async function QuestionSolutionPage({ params }: Readonly<PageProps>) {
  const resolvedParams = await params;
  const { resourceId, contentId, questionId } = resolvedParams;
  const { question, error } = await getQuestionWithSolutions(questionId)

  if (error || !question) {
    return <div>Failed to load question</div>
  }

  const questionContent = question.questionContent as any
  
  // Transform the solution data if it exists
  let existingSolution: SolutionData | undefined = undefined;
  
  if (question.solutions && question.solutions.length > 0) {
    // The content from the database is a JsonValue that needs to be properly typed
    const solutionContent = question.solutions[0].content as any;
    
    existingSolution = {
      id: question.solutions[0].id,
      questionId: question.id,
      // Handle the situation where we might be dealing with a simplified solution structure
      // or the original structure with mainSolution/subSolutions
      mainSolution: solutionContent.mainSolution || {
        type: question.type,
        content: solutionContent
      } as SolutionContent
    };
  }

  return (
    <SolutionWrapper
      questionId={question.id}
      resourceId={resourceId}
      contentId={contentId}
      questionType={question.type}
      questionContent={questionContent.mainQuestion}
      marks={questionContent.marks}
      existingSolution={existingSolution}
    />
  )
}