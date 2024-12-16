// src/components/solution/question-card.tsx
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SolutionData } from "@/types/solution";

interface QuestionCardProps {
  question: SolutionData['question'];
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-500">{question.subject} | {question.chapter}</p>
            <p className="text-sm text-gray-500">{question.resource}</p>
          </div>
          <Badge>{question.type}</Badge>
        </div>
        <CardTitle>Question {question.number}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg mb-2">{question.content}</p>
        <Badge variant="outline">{question.marks} marks</Badge>
      </CardContent>
    </Card>
  )
}