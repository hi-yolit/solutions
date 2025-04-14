"use client"

import { useRouter } from "next/navigation"
import { Question } from "@prisma/client"
import { AddQuestionDialog } from "./add-question-dialog"
import { QuestionDisplay } from "./questions-display"
import { useState } from "react"
import { deleteQuestion } from "@/actions/questions"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { ResourceType } from "@/types/resource"
import { FAB } from "@/components/ui/fab"

interface QuestionsTableProps {
  questions: (Question & {
    solutions: {
      id: string;
    }[];
    resource?: {
      type: ResourceType;
    };
  })[];
  resourceId: string;
  contentId: string;
}

export function QuestionsTable({
  questions,
  resourceId,
  contentId
}: Readonly<QuestionsTableProps>) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null)

  const handleManageSolutions = (questionId: string) => {
    const solutionPath = `/admin/resources/${resourceId}/contents/${contentId}/questions/${questionId}/solution`;
    router.push(solutionPath);
  }

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
    setAddDialogOpen(true)
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
        description: "Question deleted successfully"
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

  // Sort questions first by order, then by questionNumber if same order
  const sortedQuestions = [...questions].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    
    if (orderA !== orderB) return orderA - orderB;
    return a.questionNumber.localeCompare(b.questionNumber);
  });

  return (
    <div className="space-y-6 relative pb-16">
      {questions.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No questions added yet
        </div>
      ) : (
        sortedQuestions.map((question) => (
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
        contentId={contentId}
        questionToEdit={editingQuestion}
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open)
          if (!open) setEditingQuestion(null)
        }}
        totalQuestions={questions.length}
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

      <FAB 
        onClick={() => {
          setEditingQuestion(null)
          setAddDialogOpen(true)
        }}
        text="Add Question"
      />
    </div>
  )
}