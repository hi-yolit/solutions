'use client'

import { useState } from "react"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FAB } from "@/components/ui/fab"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QuestionsTable } from "./questions-table"
import { AddQuestionDialog } from "./add-question-dialog"
import { Topic, Question, ResourceType } from "@prisma/client"

interface TopicWithQuestions extends Topic {
  questions: (Question & {
    solutions: {
      id: string
    }[];
    resource: {
      type: ResourceType
    }
  })[];
}

interface TopicQuestionsClientProps {
  topic: TopicWithQuestions;
  resourceId: string;
  chapterId: string;
  topicId: string;
}

export function TopicQuestionsClient({ 
  topic,
  resourceId,
  chapterId,
  topicId
}: TopicQuestionsClientProps) {
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false)

  // Calculate totals from real data
  const totalMarks = topic.questions.reduce((acc, q) => {
    const content = q.content as any;
    return acc + (content.marks || 0);
  }, 0);

  const questionsWithSolutions = topic.questions.filter(q => q.solutions.length > 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/resources/${resourceId}/chapters/${chapterId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold">Topic Questions</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {topic.title || 'Untitled Topic'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Questions</dt>
              <dd>{topic.questions.length}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Marks</dt>
              <dd>{totalMarks}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">With Solutions</dt>
              <dd>{questionsWithSolutions.length}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{topic?.questions[0]?.resource.type === "TEXTBOOK" ? "Exercises" : "Questions"}</h3>
        </div>

        <QuestionsTable 
          questions={topic.questions}
          resourceId={resourceId}
          chapterId={chapterId}
          topicId={topicId}
        />

        <AddQuestionDialog
          resourceId={resourceId}
          chapterId={chapterId}
          topicId={topicId}
          open={isAddQuestionOpen}
          onOpenChange={setIsAddQuestionOpen}
        />
      </div>

      <FAB 
        onClick={() => setIsAddQuestionOpen(true)}
        text="Add Question"
      />
    </div>
  )
}