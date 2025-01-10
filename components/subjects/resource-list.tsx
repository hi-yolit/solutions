// components/subjects/resource-list.tsx
import { Resource, ResourceType } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { Book, BookOpen, FileText } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface ResourceListProps {
  resources: Resource[] | undefined;
  currentPage: number;
}

const resourceTypeLabels: Record<ResourceType, string> = {
  TEXTBOOK: 'Textbook',
  PAST_PAPER: 'Past Paper',
  STUDY_GUIDE: 'Study Guide',
}

export function ResourceList({ resources = [], currentPage }: ResourceListProps) {
  if (!resources?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No resources found
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
      {resources.map((resource) => (
        <Link
          key={resource.id}
          href={`/subjects/${resource.subject.toLowerCase()}/resources/${resource.id}`}
          className="block"
        >
          <Card className="p-4 hover:shadow-md transition-shadow h-full">
            <div className="flex gap-4">
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
                <div className="flex-shrink-0 w-32 h-40 bg-muted flex items-center justify-center">
                  {resource.type === ResourceType.TEXTBOOK ? (
                    <Book className="h-8 w-8 text-muted-foreground" />
                  ) : resource.type === ResourceType.PAST_PAPER ? (
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{resource.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {resourceTypeLabels[resource.type]}
                  {resource.type === ResourceType.TEXTBOOK && resource.edition && (
                    <> • Edition: {resource.edition}</>
                  )}
                  {resource.type === ResourceType.TEXTBOOK && resource.publisher && (
                    <> • Publisher: {resource.publisher}</>
                  )}
                  {(resource.type === ResourceType.PAST_PAPER || resource.type === ResourceType.STUDY_GUIDE) && resource.year && (
                    <> • Year: {resource.year} {resource.term && ` • Term ${resource.term}`}</>
                  )}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge>{resource.curriculum}</Badge>
                  <Badge variant="outline">Grade {resource.grade}</Badge>
                </div>
                <div className="flex items-center text-primary">
                  {resource.type === ResourceType.TEXTBOOK ? (
                    <>
                      <BookOpen className="h-4 w4 mr-2" />
                      <span className="text-sm">View Chapters</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span className="text-sm">View Questions</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}