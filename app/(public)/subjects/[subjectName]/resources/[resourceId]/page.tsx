// app/resources/[resourceId]/page.tsx
import { getResourceWithContent } from '@/actions/resources'
import { Book, BookOpen, FileText } from 'lucide-react'
import Image from 'next/image'
import { Badge } from "@/components/ui/badge"
import { ResourceType } from "@prisma/client"
// import { ResourceWithContent } from "@/types/resource"
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
    <main className="min-h-screen bg-background">
      <ResponsiveBreadcrumb
        resource={{
          subject: resource.subject.toLowerCase(),
          title: resource.title,
        }}
      />

      {/* Main Content */}
      <div className="container max-w-[64rem] mx-auto py-4 md:py-8">
        {/* Resource Header */}
        <div>
          <div className="vertical-padding">
            <div className="flex flex-row w-full gap-2">
              <div className="flex w-full gap-2 justify-between items-center">
                {/* Title & Basic Info */}
                <div className="gap-4 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 text-xs font-bold text-blue-500 md:text-base">
                    <span>{resource.year ? ` ${resource.year}` : ""}</span>
                    <span>•</span>
                    <span>{resource.subject.toLocaleUpperCase()}</span>
                    <span>•</span>
                    <span>GR {resource.grade}</span>
                    {resource.type === "TEXTBOOK" && resource.publisher && (
                      <>
                        <span>•</span>
                        <span>{resource.publisher}</span>
                      </>
                    )}
                  </div>

                  <h1 className="text-2xl text-pretty font-semibold tracking-tight md:text-3xl lg:text-4xl">
                    {resource.title}
                  </h1>
                </div>

                {/* Cover Image */}
                <div className="bg-muted rounded-lg">
                  {resource.coverImage ? (
                    <div className="flex-shrink-0 w-16 h-20 bg-muted relative">
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
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 w-full">
              <div className="py-4 md:py-8">
                <p className="text-muted-foreground text-sm md:text-md">
                  {resource.type === ResourceType.TEXTBOOK
                    ? `Complete solutions for ${resource.title}. Access step-by-step solutions to exercises, examples, and practice problems.`
                    : `Detailed solutions for ${resource.title}. Access comprehensive solutions with detailed explanations and working.`}
                </p>
              </div>

              <div className="flex items-center justify-between w-full gap-2 md:justify-start md:gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold">
                    {questionCount || 0} questions
                  </span>
                </div>
                <Badge>{resource.curriculum}</Badge>
                <Badge variant="secondary">
                  {resource.type === ResourceType.TEXTBOOK
                    ? "Textbook"
                    : "Past Paper"}
                </Badge>
                {resource.type === ResourceType.TEXTBOOK &&
                  resource.edition && (
                    <Badge variant="outline">{resource.edition} Edition</Badge>
                  )}
                {/* {resource.type === ResourceType.PAST_PAPER && (
                  <Badge variant="outline">
                    {resource.term ? `Term ${resource.term}` : ""}
                    {resource.year ? ` ${resource.year}` : ""}
                  </Badge>
                )} */}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-b border-slate-500/50 pb-4"></div>
        </div>

        {/* Resource Content */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {resource.type === ResourceType.TEXTBOOK
                ? "Table of Contents"
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