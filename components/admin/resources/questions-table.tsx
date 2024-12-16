// src/components/admin/resources/questions-table.tsx
"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Edit, Eye, Plus } from "lucide-react"

interface Question {
  id: string
  number: string
  type: string
  marks: number
  hasSolution: boolean
  status: string
  content: string
}

interface QuestionsTableProps {
  questions: Question[]
  resourceId: string
  chapterId: string
  topicId: string
}

export function QuestionsTable({ 
  questions,
  resourceId,
  chapterId,
  topicId
}: QuestionsTableProps) {
    const router = useRouter()


  const handleSolutionClick = (questionId: string, hasSolution: boolean) => {
    const path = `/admin/resources/${resourceId}/chapters/${chapterId}/topics/${topicId}/questions/${questionId}/solution`
    
    // If there's already a solution, we might want to view/edit it
    // If not, we're adding a new one
    router.push(path)
  }

return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Number</TableHead>
            <TableHead>Question</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Marks</TableHead>
            <TableHead>Solution</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.id}>
              <TableCell>{question.number}</TableCell>
              <TableCell className="max-w-md">
                <p className="truncate">{question.content}</p>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {question.type}
                </Badge>
              </TableCell>
              <TableCell>{question.marks}</TableCell>
              <TableCell>
                <Badge variant={question.hasSolution ? 'default' : 'secondary'}>
                  {question.hasSolution ? 'Added' : 'Missing'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant={question.hasSolution ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleSolutionClick(question.id, question.hasSolution)}
                  >
                    {question.hasSolution ? (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        View Solution
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Solution
                      </>
                    )}
                  </Button>
                  {question.hasSolution && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSolutionClick(question.id, true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Solution
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}