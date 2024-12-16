// src/app/subjects/[subjectName]/chapters/[chapterId]/topics/[topicId]/page.tsx
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// This would come from your database
const topicData = {
  id: '1',
  title: 'Arithmetic Sequences',
  questions: [
    {
      id: '1',
      number: '1.1',
      type: 'STRUCTURED',
      content: 'Find the nth term of the sequence: 3, 7, 11, 15, ...',
      marks: 4
    },
    {
      id: '2',
      number: '1.2',
      type: 'MCQ',
      content: 'Which of the following is not an arithmetic sequence?',
      marks: 2
    }
  ]
}

export default function TopicPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{topicData.title}</h1>

      <div className="grid gap-6">
        {topicData.questions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Question {question.number}
                <div className="flex gap-2">
                  <Badge variant="outline">{question.marks} marks</Badge>
                  <Badge>{question.type}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{question.content}</p>
              <a 
                href={`/solutions/${question.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                View Solution
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}