// src/app/subjects/[subjectName]/page.tsx
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CurriculumType } from "@/types"

interface SubjectPageProps {
  params: {
    subjectName: string
  }
}

// This would come from your database
const subjectData = {
  name: 'Mathematics',
  curriculumType: 'CAPS' as CurriculumType,
  grades: [12],
  chapters: [
    {
      id: '1',
      number: 1,
      title: 'Sequences and Series',
      topics: [
        { id: '1', title: 'Arithmetic Sequences' },
        { id: '2', title: 'Geometric Sequences' },
      ]
    },
    {
      id: '2',
      number: 2,
      title: 'Functions',
      topics: [
        { id: '3', title: 'Quadratic Functions' },
        { id: '4', title: 'Exponential Functions' },
      ]
    }
  ],
  resources: [
    {
      id: '1',
      type: 'TEXTBOOK',
      title: 'Mind Action Series',
      year: 2023
    },
    {
      id: '2',
      type: 'PAST_PAPER',
      title: 'IEB Paper 1',
      term: 2,
      year: 2023
    }
  ]
}

export default function SubjectPage({ params }: SubjectPageProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{subjectData.name}</h1>
        <Badge>{subjectData.curriculumType}</Badge>
      </div>

      <Tabs defaultValue="chapters">
        <TabsList>
          <TabsTrigger value="chapters">Chapters</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="chapters">
          <div className="grid gap-6">
            {subjectData.chapters.map((chapter) => (
              <Card key={chapter.id}>
                <CardHeader>
                  <CardTitle>
                    Chapter {chapter.number}: {chapter.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {chapter.topics.map((topic) => (
                      <a 
                        key={topic.id}
                        href={`/subjects/${params.subjectName}/chapters/${chapter.id}/topics/${topic.id}`}
                        className="p-2 hover:bg-slate-100 rounded-md"
                      >
                        {topic.title}
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid gap-6">
            {subjectData.resources.map((resource) => (
              <Card key={resource.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {resource.title}
                    <Badge>{resource.type}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  
                  <a 
                        key={resource.id}
                        href={`/resources/${resource.id}`}
                      >
                      <p className="text-sm text-gray-500">
                        {resource.type === 'PAST_PAPER' 
                          ? `Term ${resource.term} - ${resource.year}`
                          : resource.year
                        }
                      </p>
                      </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}