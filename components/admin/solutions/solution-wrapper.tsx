'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { MCQSolutionEditor } from './mcq-solution-editor'
import { StructuredSolutionEditor } from './structured-solution-editor'
import { EssaySolutionEditor } from './essay-solution-editor'
import { ProofSolutionEditor } from './proof-solution-editor'
import {
  QuestionType,
  SolutionData,
  MCQSolution,
  StructuredStep,
  EssayOutlinePoint,
  ProofStep,
  SolutionContent,
} from '@/types/solution'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { createSolution, updateSolution } from '@/actions/solutions'
import Latex from 'react-latex-next'

interface SolutionWrapperProps {
  questionId: string
  resourceId: string
  contentId: string  // Changed from chapterId
  questionType: QuestionType
  questionContent: string
  marks?: number | null
  existingSolution?: SolutionData
}

export function SolutionWrapper({
  questionId,
  resourceId,
  contentId,
  questionType: initialType,
  questionContent,
  marks,
  existingSolution,
}: SolutionWrapperProps) {
  const [solutionType, setSolutionType] = useState<QuestionType>(
    existingSolution?.mainSolution?.type || initialType
  );
  
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSave = async (
    data: MCQSolution | StructuredStep[] | EssayOutlinePoint[] | ProofStep[]
  ) => {
    try {
      setIsLoading(true);

      const solutionContent: SolutionContent = {
        type: solutionType,
        content: data
      };

      const solutionData: SolutionData = {
        questionId,
        mainSolution: solutionContent
      };

      let result;
      if (existingSolution?.id) {
        result = await updateSolution(existingSolution.id, solutionData);
      } else {
        result = await createSolution(solutionData);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Solution saved successfully"
      });

      router.push(getReturnPath());
    } catch (error) {
      toast({
        title: "Error",
        description: typeof error === 'string' ? error : "Failed to save solution",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getReturnPath = () => {
    // Updated return path to match new structure
    return `/admin/resources/${resourceId}/contents/${contentId}/questions`;
  };

  const renderEditor = () => {
    // Get the existing solution content if available
    let content = existingSolution?.mainSolution?.content;

    switch (solutionType) {
      case 'MCQ':
        return (
          <MCQSolutionEditor
            initialData={content as MCQSolution}
            onSave={handleSave}
          />
        );
      case 'STRUCTURED':
        return (
          <StructuredSolutionEditor
            initialData={content as StructuredStep[]}
            onSave={handleSave}
          />
        );
      case 'ESSAY':
        return (
          <EssaySolutionEditor
            initialData={content as EssayOutlinePoint[]}
            onSave={handleSave}
          />
        );
      case 'PROOF':
        return (
          <ProofSolutionEditor
            initialData={content as ProofStep[]}
            onSave={handleSave}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center gap-4 p-6 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {existingSolution ? 'Edit Solution' : 'Create Solution'}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              <p><Latex>{questionContent}</Latex></p>
              {marks && (
                <p className="text-sm text-muted-foreground mt-2">
                  Marks: {marks}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>Solution</CardTitle>
              <Select
                value={solutionType}
                onValueChange={(value: QuestionType) => setSolutionType(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">Multiple Choice</SelectItem>
                  <SelectItem value="STRUCTURED">Structured</SelectItem>
                  <SelectItem value="ESSAY">Essay</SelectItem>
                  <SelectItem value="PROOF">Proof</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {renderEditor()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}