"use client"

import { useRouter } from "next/navigation"
import { Question } from "@prisma/client"
import { AddQuestionDialog } from "./add-question-dialog"
import { QuestionDisplay } from "./questions-display" 
import { useState } from "react"

interface QuestionsTableProps {
 questions: (Question & {
   solutions: {
     id: string;
   }[];
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
}: QuestionsTableProps) {
 const router = useRouter()
 const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

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
   </div>
 )
}