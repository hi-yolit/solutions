"use client"

import { useRouter } from "next/navigation"
import { Question } from "@prisma/client"
import { AddQuestionDialog } from "./add-question-dialog"
import { QuestionDisplay } from "./questions-display"
import { useState } from "react"
import { deleteQuestion } from "@/actions/questions"
import { AlertDialogHeader, AlertDialogFooter, AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { ResourceType } from "@/types/resource"


interface QuestionsTableProps {
  questions: (Question & {
    solutions: {
      id: string;
    }[];
    resource: {
      type: ResourceType;
    };
  })[];
  resourceId: string;
  chapterId: string;
  topicId?: string;
}

export function QuestionsTable({
  questions,
  resourceId,
  chapterId,
  topicId
}: Readonly<QuestionsTableProps>) {
  const router = useRouter()
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null)

  const handleManageSolutions = (questionId: string) => {
    const basePath = `/admin/resources/${resourceId}/chapters/${chapterId}`;
    const solutionPath = topicId
      ? `${basePath}/topics/${topicId}/questions/${questionId}/solution`
      : `${basePath}/questions/${questionId}/solution`;

    router.push(solutionPath);
  }

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
  }

  const handleDelete = async () => {
    if (!questionToDelete) return

    try {
      const result = await deleteQuestion(questionToDelete.id)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Success",
        description: "Topic deleted successfully"
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      })
    } finally {
      setDeleteDialogOpen(false)
      setQuestionToDelete(null)
    }
  }
  return (
    <div className="space-y-6">
      {questions.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No questions added yet
        </div>
      ) : (
        questions.map((question) => (
          <QuestionDisplay
            key={question.id}
            question={question}
            onManageSolutions={() => handleManageSolutions(question.id)}
            onEdit={() => handleEdit(question)}
            onDelete={() => {
              setQuestionToDelete(question)
              setDeleteDialogOpen(true)
            }}
          />
        ))
      )}

      <AddQuestionDialog
        resourceId={resourceId}
        chapterId={chapterId}
        topicId={topicId}
        questionToEdit={editingQuestion}
        open={!!editingQuestion}
        onOpenChange={(open) => {
          if (!open) setEditingQuestion(null)
        }}
      />


      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this question
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}