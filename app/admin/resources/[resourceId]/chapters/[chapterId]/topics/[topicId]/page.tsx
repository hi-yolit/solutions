import { getTopicWithQuestions } from '@/actions/questions'
import { TopicQuestionsClient } from '@/components/admin/resources/topic-questions-client'

export default async function TopicDetailsPage({
  params
}: {
  params: { resourceId: string; chapterId: string; topicId: string }
}) {
  const { topic, error } = await getTopicWithQuestions(params.topicId)

  if (error || !topic) {
    return <div>Failed to load topic</div>
  }

  console.log(topic)

  return (
    <TopicQuestionsClient 
      topic={topic}
      resourceId={params.resourceId}
      chapterId={params.chapterId}
      topicId={params.topicId}
    />
  )
}