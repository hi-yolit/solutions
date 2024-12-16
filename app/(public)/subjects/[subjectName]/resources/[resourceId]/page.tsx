// src/app/subjects/[subjectName]/resources/[resourceId]/page.tsx
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText } from "lucide-react"

const resourceData = {
  id: '1',
  title: 'Mind Action Series',
  type: 'TEXTBOOK',
  subject: 'Mathematics',
  grade: 12,
  curriculum: 'CAPS',
  year: 2023,
  publisher: 'Mind Action Series',
  chapters: [
    {
      id: '1',
      number: 1,
      title: 'Sequences and Series',
      exercises: [
        {
          id: '1',
          title: 'Exercise 1.1',
          questionCount: 8,
          completedSolutions: 8
        },
        {
          id: '2',
          title: 'Exercise 1.2',
          questionCount: 10,
          completedSolutions: 6
        }
      ]
    },
    {
      id: '2',
      number: 2,
      title: 'Functions',
      exercises: [
        {
          id: '3',
          title: 'Exercise 2.1',
          questionCount: 12,
          completedSolutions: 12
        }
      ]
    }
  ],
  stats: {
    totalQuestions: 180,
    completedSolutions: 156,
    expertContributors: 12
  }
}

export default function ResourcePage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold">{resourceData.title}</h1>
            <p className="text-gray-500 mt-2">
              Grade {resourceData.grade} | {resourceData.year} | {resourceData.publisher}
            </p>
          </div>
          <Badge>{resourceData.curriculum}</Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{resourceData.stats.totalQuestions}</p>
                <p className="text-sm text-gray-500">Total Questions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{resourceData.stats.completedSolutions}</p>
                <p className="text-sm text-gray-500">Available Solutions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{resourceData.stats.expertContributors}</p>
                <p className="text-sm text-gray-500">Expert Contributors</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chapters */}
      <div className="grid gap-6">
        {resourceData.chapters.map((chapter) => (
          <Card key={chapter.id}>
            <CardHeader>
              <CardTitle>Chapter {chapter.number}: {chapter.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {chapter.exercises.map((exercise) => (
                  <div 
                    key={exercise.id}
                    className="border rounded-lg p-4 hover:bg-slate-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{exercise.title}</h3>
                        <p className="text-sm text-gray-500">
                          {exercise.completedSolutions} of {exercise.questionCount} solutions available
                        </p>
                      </div>
                      <Button>
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Solutions
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}