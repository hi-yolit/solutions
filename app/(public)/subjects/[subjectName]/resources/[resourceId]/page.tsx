// app/resources/[resourceId]/page.tsx
import { getResourceWithContent } from '@/actions/resources'
import { ChevronLeft, Book, BookOpen, FileText } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from "@/components/ui/badge"
import { ResourceType } from "@prisma/client"
import { ResourceWithContent } from "@/types/resource"
import { ChapterAccordion } from '@/components/resources/chapter-accordion'
import ResponsiveBreadcrumb from '@/components/responsive-breadcrumb'

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

  function getQuestionCount(resource: any): number {
    return resource.chapters.reduce((total: any, chapter: { questions: string | any[] }) => {
      return total + chapter.questions.length;
    }, 0);
  }

  const questionCount = getQuestionCount(resource);

  return (
    <main className="min-h-screen bg-background bg-green-400">
      {/* Breadcrumb */}
      {/* <div className="border-b bg-blue-400">
        <div className="container max-w-[64rem] mx-auto px-4">
          <div className="flex items-center h-14 text-sm">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <ChevronLeft className="h-4 w-4 mx-2 text-muted-foreground" />
            <Link
              href={`/subjects/${resource.subject.toLowerCase()}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {resource.subject}
            </Link>
            <ChevronLeft className="h-4 w-4 mx-2 text-muted-foreground" />
            <span className="text-foreground truncate">{resource.title}</span>
          </div>
        </div>
      </div> */}

      <ResponsiveBreadcrumb
        resource={{
          subject: resource.subject.toLowerCase(),
          title: resource.title,
        }}
      />

      {/* Main Content */}
      <div className="container max-w-[64rem] mx-auto px-4 py-8">
        {/* Resource Header */}
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Cover Image */}
          <div className="bg-muted rounded-lg">
            {resource.coverImage ? (
              <div className="flex-shrink-0 w-32 h-40 bg-muted relative">
                <Image
                  src={resource.coverImage}
                  alt={resource.title}
                  fill
                  className="object-contain"
                />
              </div>
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

          {/* Details */}
          <div className="flex-1 w-full">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {resource.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                  <span>{resource.subject}</span>
                  <span>•</span>
                  <span>Grade {resource.grade}</span>
                  {resource.type === ResourceType.TEXTBOOK &&
                    resource.publisher && (
                      <>
                        <span>•</span>
                        <span>{resource.publisher}</span>
                      </>
                    )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{resource.curriculum}</Badge>
              <Badge variant="secondary">
                {resource.type === ResourceType.TEXTBOOK
                  ? "Textbook"
                  : "Past Paper"}
              </Badge>
              {resource.type === ResourceType.TEXTBOOK && resource.edition && (
                <Badge variant="outline">{resource.edition} Edition</Badge>
              )}
              {resource.type === ResourceType.PAST_PAPER && (
                <Badge variant="outline">
                  {resource.term ? `Term ${resource.term}` : ""}
                  {resource.year ? ` ${resource.year}` : ""}
                </Badge>
              )}
            </div>

            <div className="mt-6">
              <p className="text-muted-foreground">
                {resource.type === ResourceType.TEXTBOOK
                  ? `Complete solutions for ${resource.title}. Access step-by-step solutions to exercises, examples, and practice problems.`
                  : `Detailed solutions for ${resource.title}. Access comprehensive solutions with detailed explanations and working.`}
              </p>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {questionCount || 0} questions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Content */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {resource.type === ResourceType.TEXTBOOK
                ? "Chapters"
                : "Questions"}
            </h2>
          </div>

          {resource.chapters.length > 0 ? (
            <div className="space-y-4">
              {resource.chapters.map((chapter) => (
                <ChapterAccordion
                  key={chapter.id}
                  chapter={chapter}
                  resourceType={resource.type}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No content available yet
            </div>
          )}
        </div>
      </div>
    </main>
  );
}