import { getChapterWithTopics } from '@/actions/topics'
import { TopicsSection } from '@/components/admin/resources/topics-section'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ChapterDetailsPage({
  params
}: {
  params: { resourceId: string; chapterId: string }
}) {
  const { chapter, error } = await getChapterWithTopics(params.chapterId)

  if (error || !chapter) {
    return <div>Failed to load chapter</div>
  }

  // Calculate total questions using _count
  const totalQuestions = chapter.topics.reduce((acc, topic) => acc + topic._count.questions, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/resources/${params.resourceId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold">Chapter Details</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Chapter {chapter.number}: {chapter.title || 'Untitled'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Topics</dt>
              <dd>{chapter.topics.length}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Questions</dt>
              <dd>{totalQuestions}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <TopicsSection 
        topics={chapter.topics}
        resourceId={params.resourceId}
        chapterId={params.chapterId}
      />
    </div>
  )
}