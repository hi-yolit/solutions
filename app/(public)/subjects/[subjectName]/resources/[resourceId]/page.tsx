// app/resources/[resourceId]/page.tsx
import { getResourceWithContent } from '@/actions/resources'
import { Badge } from "@/components/ui/badge"
import { ChapterAccordion } from '@/components/resources/chapter-accordion'
import { ResourceType } from '@prisma/client'
import { ResourceWithContent } from '@/types/resource'
import Link from 'next/link'
import { Book, BookOpen, ChevronLeft, FileText, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

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
    <div className="py-8 px-4 max-w-[64rem] mx-auto">
      {/* Top Section */}
      <div className="flex items-start gap-6 mb-8">
        <div className="w-[200px] h-[250px] bg-muted rounded-lg relative">
          {resource.coverImage ? (
            <Image
              src={resource.coverImage}
              alt={resource.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              {resource.type === ResourceType.TEXTBOOK ? (
                <Book className="h-12 w-12 text-muted-foreground" />
              ) : resource.type === ResourceType.PAST_PAPER ? (
                <FileText className="h-12 w-12 text-muted-foreground" />
              ) : (
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{resource.title}</h1>
          <div className="text-muted-foreground space-y-1 mb-4">
            {resource.type === ResourceType.TEXTBOOK ? (
              <>
                {resource.edition && <p>Edition: {resource.edition}</p>}
                {resource.publisher && <p>ISBN: {resource.publisher}</p>}
              </>
            ) : (
              <>
                {resource.term && <p>Term {resource.term}</p>}
                {resource.year && <p>Year: {resource.year}</p>}
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>{resource.curriculum}</Badge>
            <Badge variant="outline">Grade {resource.grade}</Badge>
          </div>
          <div className="flex items-center gap-4">
            {resource.type === ResourceType.TEXTBOOK ? (
              <>
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-primary">View Textbook</span>
              </>
            ) : (
              <>
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-primary">View Questions</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="mb-8">
        <div className="space-y-4">
          {resource.chapters.map((chapter) => (
            <ChapterAccordion
              key={chapter.id}
              chapter={chapter}
              resourceType={resource.type}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/" className="text-primary flex items-center gap-2">
          <ChevronLeft className="h-5 w-5" />
          Back to Subjects
        </Link>
      </div>
    </div>
  )
}