// components/solution/question-viewer.tsx
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuestionType } from "@/types/solution"
import { ContentRenderer } from "../shared/content-renderer"

interface QuestionViewerProps {
  mainQuestion: string
  marks?: number | null
  subQuestions?: {
    type: QuestionType
    part: string
    text: string
    marks: number | null
  }[]
}

export function QuestionViewer({ 
  mainQuestion,
  marks,
  subQuestions 
}: QuestionViewerProps) {
  return (
    <Card>
      <CardHeader>
        {marks && (
          <Badge variant="outline" className="w-fit">
            {marks} marks
          </Badge>
        )}
        <div className="prose max-w-none">
          <ContentRenderer content={mainQuestion} />
        </div>
      </CardHeader>

      {subQuestions && subQuestions.length > 0 && (
        <CardContent>
          <div className="space-y-4">
            {subQuestions.map((sq) => (
              <div key={sq.part} className="pl-4 border-l-2 border-muted">
                <div className="flex items-start gap-4">
                  <Badge variant="outline">{sq.part}</Badge>
                  <div className="flex-1 space-y-2">
                    <div className="prose max-w-none">
                    <ContentRenderer content={sq.text} />
                    </div>
                    {sq.marks && (
                      <p className="text-sm text-muted-foreground">
                        {sq.marks} marks
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}