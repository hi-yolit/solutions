// src/app/admin/resources/[resourceId]/chapters/[chapterId]/topics/[topicId]/page.tsx
"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QuestionsTable } from "@/components/admin/resources/questions-table"
import { AddQuestionDialog } from "@/components/admin/resources/add-question-dialog"

// Sample data
const topicData = {
  id: "1",
  number: "1.1",
  title: "Arithmetic Sequences",
  questions: [
    {
      id: "1",
      number: "1",
      type: "STRUCTURED",
      marks: 5,
      hasSolution: true,
      status: "active",
      content: "Find the next three terms of the sequence: 2, 5, 8, 11, ..."
    },
    {
      id: "2",
      number: "2",
      type: "MCQ",
      marks: 2,
      hasSolution: true,
      status: "active",
      content: "Which of the following is the common difference..."
    }
  ]
}

export default function TopicDetailsPage() {
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false)
  const params = useParams()
  const { resourceId, chapterId, topicId } = params

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
            Topic {topicData.number}: {topicData.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Questions</dt>
              <dd>{topicData.questions.length}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Marks</dt>
              <dd>{topicData.questions.reduce((acc, q) => acc + q.marks, 0)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">With Solutions</dt>
              <dd>{topicData.questions.filter(q => q.hasSolution).length}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Questions</h3>
          <Button onClick={() => setIsAddQuestionOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        <QuestionsTable 
          questions={topicData.questions}
          resourceId={resourceId as string}
          chapterId={chapterId as string}
          topicId={topicId as string}
        />

        <AddQuestionDialog
          resourceId={resourceId as string}
          chapterId={chapterId as string}
          topicId={topicId as string}
          open={isAddQuestionOpen}
          onOpenChange={setIsAddQuestionOpen}
        />
      </div>
    </div>
  )
}