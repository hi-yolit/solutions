// components/subjects/resource-list.tsx
import { Resource } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface ResourceListProps {
  resources: Resource[] | undefined;
  currentPage: number;
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
    <div className="grid gap-6">
      {resources.map((resource) => (
        <Link 
          key={resource.id}
          href={`/subjects/${resource.subject.toLowerCase()}/resources/${resource.id}`}
          className="block"
        >
          <div className="flex gap-6 p-4 hover:bg-accent rounded-lg">
            <div className="relative w-32 h-40">
              {resource.coverImage ? (
                <Image
                  src={resource.coverImage}
                  alt={resource.title}
                  fill
                  className="object-cover rounded"
                />
              ) : (
                <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-1">{resource.title}</h3>
              {resource.edition && (
                <p className="text-sm text-muted-foreground mb-2">
                  {resource.edition}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge>{resource.curriculum}</Badge>
                <Badge variant="outline">Grade {resource.grade}</Badge>
                <Badge variant="outline">{resource.type}</Badge>
                {resource.publisher && (
                  <Badge variant="outline">{resource.publisher}</Badge>
                )}
              </div>
              {resource.term && resource.year && (
                <p className="text-sm text-muted-foreground">
                  Term {resource.term} - {resource.year}
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}