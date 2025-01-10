// app/resources/[resourceId]/page.tsx
import { getResourceWithContent } from '@/actions/resources'
import { Badge } from "@/components/ui/badge"
import { ChapterAccordion } from '@/components/resources/chapter-accordion'
import { ResourceType } from '@prisma/client'
import { ResourceWithContent } from '@/types/resource'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface PageProps {
  params: {
    resourceId: string
  }
}

export default async function ResourcePage({ params }: PageProps) {
  const { resource, error } = await getResourceWithContent(params.resourceId)

  if (error || !resource) {
    return <div>Failed to load resource</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href={`/subjects/${resource.subject.toLowerCase()}`} 
          className="hover:text-foreground"
        >
          {resource.subject}
        </Link>
        <span>/</span>
        <span>
          {resource.type === ResourceType.TEXTBOOK ? 'Textbook solutions' : 'Past Paper'}
        </span>
      </div>

      {/* Title Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{resource.title}</h1>
        {resource.type === ResourceType.TEXTBOOK ? (
          <div className="text-muted-foreground space-y-1">
            {resource.edition && <p>{resource.edition} Edition</p>}
            {resource.publisher && <p>ISBN: {resource.publisher}</p>}
          </div>
        ) : (
          <div className="text-muted-foreground">
            {resource.term && <p>Term {resource.term}</p>}
            {resource.year && <p>{resource.year}</p>}
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <div className="mb-6 flex items-center gap-2 border-b">
        <div className="px-4 py-2 border-b-2 border-primary">
          {resource.type === ResourceType.TEXTBOOK ? 'Textbook solutions' : 'Questions'} 
          <Badge variant="secondary" className="ml-2">Verified</Badge>
        </div>
      </div>

      {/* Chapters List */}
      <div className="space-y-1">
        {resource.chapters.map((chapter) => (
          <ChapterAccordion 
            key={chapter.id}
            chapter={chapter}
            resourceType={resource.type}
          />
        ))}
      </div>
    </div>
  )
}