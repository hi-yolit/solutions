import { getTopicWithQuestions } from '@/actions/questions'
import { TopicQuestionsClient } from '@/components/admin/resources/topic-questions-client'

export default async function TopicDetailsPage({
  params
}: Readonly<{
  params: Promise<{ resourceId: string; chapterId: string; topicId: string }>
}>) {
  const resolvedParams = await params;
  const { topic, error } = await getTopicWithQuestions(resolvedParams.topicId)

  if (error || !topic) {
    return <div>Failed to load topic</div>
  }

  console.log(topic)

  return (
    <TopicQuestionsClient 
      topic={topic}
      resourceId={resolvedParams.resourceId}
      chapterId={resolvedParams.chapterId}
      topicId={resolvedParams.topicId}
    />
  )
}