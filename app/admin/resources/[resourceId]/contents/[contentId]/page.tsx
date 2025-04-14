import { getContentWithChildren } from '@/actions/contents'
import { ContentSection } from '@/components/admin/resources/content-section'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ContentType } from '@prisma/client'

export default async function ContentDetailsPage({
  params
}: Readonly<{
  params: { resourceId: string; contentId: string }
}>) {
  const { content, children, resource, error } = await getContentWithChildren(params.contentId)

  if (error || !content || !resource) {
    return <div>Failed to load content</div>
  }

  // Get content items appropriate for this level, sorted by order
  const getChildContent = () => {
    // Get appropriate content types based on current content
    if (content.type === 'CHAPTER') {
      // For chapters, show sections and pages
      return children
        .filter(child => child.type === 'SECTION' || child.type === 'PAGE')
        .sort((a, b) => a.order - b.order);
    } else if (content.type === 'SECTION') {
      // For sections, show pages
      return children
        .filter(child => child.type === 'PAGE')
        .sort((a, b) => a.order - b.order);
    } else if (content.type === 'PAGE') {
      // For pages, show exercises
      return children
        .filter(child => child.type === 'EXERCISE')
        .sort((a, b) => a.order - b.order);
    }
    return [];
  };

  // Get appropriate content type options for this level
  const getContentTypeOptions = () => {
    if (content.type === 'CHAPTER') {
      return [ContentType.SECTION, ContentType.PAGE];
    } else if (content.type === 'SECTION') {
      return [ContentType.PAGE];
    } else if (content.type === 'PAGE') {
      return [ContentType.EXERCISE];
    }
    return [];
  };

  // Calculate total questions
  const totalQuestions = children.reduce((acc, child) => 
    acc + (child._count?.questions || 0), 0);

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

  // Get appropriate section title based on content type
  const getSectionTitle = () => {
    if (content.type === 'CHAPTER') {
      return 'Content';
    } else if (content.type === 'SECTION') {
      return 'Pages';
    } else if (content.type === 'PAGE') {
      return 'Exercises';
    }
    return 'Content';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/resources/${params.resourceId}`}>
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
            <div>
              <dt className="text-sm font-medium text-gray-500">Child Items</dt>
              <dd>{getChildContent().length}</dd>
            </div>
            {content.type !== 'EXERCISE' && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Questions</dt>
                <dd>{totalQuestions}</dd>
              </div>
            )}
            {content.pageNumber && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Page Number</dt>
                <dd>{content.pageNumber}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <ContentSection 
        contents={getChildContent()}
        resourceId={params.resourceId}
        resourceType={resource.type}
        contentTypeOptions={getContentTypeOptions()}
        parentId={content.id}
        title={getSectionTitle()}
      />
    </div>
  )
}