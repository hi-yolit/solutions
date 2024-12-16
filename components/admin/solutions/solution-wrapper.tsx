"use client"

import { useState, useEffect } from 'react'
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
  SolutionContent
} from '@/types/solution'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface SolutionWrapperProps {
  questionId: string
  resourceId: string
  chapterId: string
  topicId: string
  questionType: QuestionType
  questionContent: string
  marks?: number
  existingSolution?: SolutionData
}

export function SolutionWrapper({
  questionId,
  resourceId,
  chapterId,
  topicId,
  questionType: initialType,
  questionContent,
  marks,
  existingSolution,
}: SolutionWrapperProps) {
  const [solutionType, setSolutionType] = useState<QuestionType>(initialType)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    setSolutionType(initialType)
  }, [initialType])

  const handleSave = async (data: MCQSolution | StructuredStep[] | EssayOutlinePoint[] | ProofStep[]) => {
    try {
      setIsLoading(true)

      const solutionData: SolutionData = {
        questionId,
        expertId: "current-expert-id",
        solution: {
          type: solutionType,
          content: data
        },
        verificationStatus: 'PENDING'
      }

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Saving solution:', solutionData)

      toast({
        title: "Success",
        description: "Solution saved successfully"
      })

      router.push(`/admin/resources/${resourceId}/chapters/${chapterId}/topics/${topicId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save solution",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getMCQSolution = (solution: SolutionContent | undefined): MCQSolution | undefined => {
    if (solution?.type === 'MCQ') {
      return solution.content as MCQSolution
    }
    return undefined
  }

  const getStructuredSolution = (solution: SolutionContent | undefined): StructuredStep[] | undefined => {
    if (solution?.type === 'STRUCTURED') {
      return solution.content as StructuredStep[]
    }
    return undefined
  }

  const getEssaySolution = (solution: SolutionContent | undefined): EssayOutlinePoint[] | undefined => {
    if (solution?.type === 'ESSAY') {
      return solution.content as EssayOutlinePoint[]
    }
    return undefined
  }

  const getProofSolution = (solution: SolutionContent | undefined): ProofStep[] | undefined => {
    if (solution?.type === 'PROOF') {
      return solution.content as ProofStep[]
    }
    return undefined
  }

  const renderEditor = () => {
    switch (solutionType) {
      case 'MCQ':
        return (
          <MCQSolutionEditor
            initialData={getMCQSolution(existingSolution?.solution)}
            onSave={handleSave}
          />
        )
      case 'STRUCTURED':
        return (
          <StructuredSolutionEditor
            initialData={getStructuredSolution(existingSolution?.solution)}
            onSave={handleSave}
          />
        )
      case 'ESSAY':
        return (
          <EssaySolutionEditor
            initialData={getEssaySolution(existingSolution?.solution)}
            onSave={handleSave}
          />
        )
      case 'PROOF':
        return (
          <ProofSolutionEditor
            initialData={getProofSolution(existingSolution?.solution)}
            onSave={handleSave}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.push(`/admin/resources/${resourceId}/chapters/${chapterId}/topics/${topicId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {existingSolution ? 'Edit Solution' : 'Create Solution'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p>{questionContent}</p>
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
  )
}