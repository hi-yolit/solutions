'use client'

import { useState } from "react"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { QuestionsTable } from "./questions-table"
import { AddQuestionDialog } from "./add-question-dialog"
import { ChapterWithQuestions } from "@/types/question"

interface ChapterQuestionsClientProps {
  chapter: ChapterWithQuestions;
  resourceId: string;
  chapterId: string;
}

export function ChapterQuestionsClient({ 
  chapter,
  resourceId,
  chapterId,
}: ChapterQuestionsClientProps) {
    const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false)

    // Calculate totals from real data
/*     const totalMarks = chapter.questions.reduce((acc, q) => {
        const content = q.content as any;
        return acc + (content.marks || 0);
    }, 0); */

    const questionsWithSolutions = chapter.questions.filter(q => q.solutions.length > 0);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/admin/resources/${resourceId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold">Chapter Questions</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Chapter {chapter.number}: {chapter.title || 'Untitled Chapter'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-3 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Total Questions</dt>
                            <dd>{chapter.questions.length}</dd>
                        </div>
{/*                         <div>
                            <dt className="text-sm font-medium text-gray-500">Total Marks</dt>
                            <dd>{totalMarks}</dd>
                        </div> */}
                        <div>
                            <dt className="text-sm font-medium text-gray-500">With Solutions</dt>
                            <dd>{questionsWithSolutions.length}</dd>
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
                    questions={chapter.questions}
                    resourceId={resourceId}
                    chapterId={chapterId}
                />

                <AddQuestionDialog
                    resourceId={resourceId}
                    chapterId={chapterId}
                    open={isAddQuestionOpen}
                    onOpenChange={setIsAddQuestionOpen}
                />
            </div>
        </div>
    )
}