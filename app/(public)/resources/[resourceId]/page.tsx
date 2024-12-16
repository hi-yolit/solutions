// src/app/resources/[resourceId]/page.tsx
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// This would come from your database
const resourceData = {
  id: '1',
  type: 'TEXTBOOK',
  title: 'Mind Action Series Mathematics',
  subject: 'Mathematics',
  grade: 12,
  year: 2023,
  curriculum: 'CAPS',
  chapters: [
    {
      id: '1',
      number: 1,
      title: 'Sequences and Series',
      questions: [
        { id: '1', number: '1.1', type: 'STRUCTURED', hasAnswer: true },
        { id: '2', number: '1.2', type: 'MCQ', hasAnswer: true },
      ]
    }
  ]
}

export default function ResourcePage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{resourceData.title}</h1>
          <p className="text-gray-500 mt-2">
            Grade {resourceData.grade} | {resourceData.year}
          </p>
        </div>
        <Badge>{resourceData.curriculum}</Badge>
      </div>

      <div className="grid gap-6">
        {resourceData.chapters.map((chapter) => (
          <Card key={chapter.id}>
            <CardHeader>
              <CardTitle>
                Chapter {chapter.number}: {chapter.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {chapter.questions.map((question) => (
                  <div 
                    key={question.id}
                    className="flex items-center justify-between p-2 hover:bg-slate-100 rounded-md"
                  >
                    <span>Question {question.number}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline">{question.type}</Badge>
                      {question.hasAnswer && (
                        <a 
                          href={`/solutions/${question.id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Solution
                        </a>
                      )}
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