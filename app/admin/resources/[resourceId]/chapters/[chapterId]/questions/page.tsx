// pages/admin/resources/[resourceId]/chapters/[chapterId]/questions/page.tsx
import { getChapterWithQuestions } from '@/actions/questions'
import { ChapterQuestionsClient } from '@/components/admin/resources/chapter-questions-client'
import { ChapterWithQuestions, QuestionContent } from '@/types/question'

export default async function ChapterQuestionsPage({
  params
}: Readonly<{
  params: Promise<{ resourceId: string; chapterId: string }>
}>) {
  const resolvedParams = await params;
  const { chapter, error } = await getChapterWithQuestions(resolvedParams.chapterId)
  console.log(chapter)

  if (error || !chapter) {
    return <div>Failed to load chapter</div>
  }

  const transformedChapter: ChapterWithQuestions = {
    ...chapter,
    questions: chapter.questions.map(q => ({
      ...q,
      content: q.content as QuestionContent
    }))
  };

  return (
    <ChapterQuestionsClient 
      chapter={transformedChapter}
      resourceId={resolvedParams.resourceId}
      chapterId={resolvedParams.chapterId}
    />
  )
}