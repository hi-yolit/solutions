import { getContentWithChildren } from '@/actions/contents'
import { getQuestionsForContent } from '@/actions/questions' // Add this import
import { QuestionsTable } from '@/components/admin/resources/questions-table'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"


export default async function QuestionDetailsPage({
  params,
  searchParams
}: Readonly<{
  params: { resourceId: string; contentId: string },
  searchParams: { parentId?: string }
}>) {
  const { content, resource, error } = await getContentWithChildren(params.contentId)
  const parentId = searchParams.parentId

  
  // Fetch questions for this content
  const { questions } = await getQuestionsForContent(params.contentId)

  if (error || !content || !resource) {
    return <div>Failed to load content</div>
  }

  // Get appropriate page title based on resource type and content type
  const getPageTitle = () => {
    if (resource.type === 'PAST_PAPER') {
      switch (content.type) {
        case 'CHAPTER': return 'Paper Section'
        case 'SECTION': return 'Question Details'
        case 'PAGE': return 'Page Details'
        default: return 'Details'
      }
    } else {
      switch (content.type) {
        case 'CHAPTER': return 'Chapter Details'
        case 'SECTION': return 'Section Details'
        case 'PAGE': return 'Page Details'
        default: return 'Details'
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/resources/${params.resourceId}/contents/${parentId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold">{getPageTitle()}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {content.number && `${content.number}: `}{content.title || 'Untitled'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            {content.pageNumber && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Page Number</dt>
                <dd>{content.pageNumber}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Questions</h3>
        <QuestionsTable
          questions={questions}
          resourceId={params.resourceId}
          contentId={params.contentId}
        />
      </div>
    </div>
  )
}