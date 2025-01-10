import { getResourceWithChapters } from '@/actions/chapters'
import { ChaptersSection } from '@/components/admin/resources/chapters-section'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ResourceDetailsPage({
  params
}: {
  params: { resourceId: string }
}) {
  const { resource, error } = await getResourceWithChapters(params.resourceId)
  console.log(resource)

  if (error || !resource) {
    return <div>Failed to load resource</div>
  }

  const getPageTitle = () => {
    switch (resource.type) {
      case 'PAST_PAPER':
        return 'Past Paper Details'
      case 'TEXTBOOK':
        return 'Textbook Details'
      case 'STUDY_GUIDE':
        return 'Study Guide Details'
      default:
        return 'Resource Details'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/resources">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold">{getPageTitle()}</h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <CardTitle>{resource.title}</CardTitle>
              <CardDescription>
                {resource.subject} - Grade {resource.grade}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge>{resource.curriculum}</Badge>
              <Badge variant="outline">{resource.type}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Publisher</dt>
              <dd>{resource.publisher}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Year</dt>
              <dd>{resource.year}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <ChaptersSection 
        chapters={resource.chapters}
        resourceId={params.resourceId}
        resourceType={resource.type}
      />
    </div>
  )
}