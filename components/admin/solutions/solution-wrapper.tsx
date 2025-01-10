"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
  SubQuestionSolution
} from '@/types/solution'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { createSolution, updateSolution } from '@/actions/solutions'
import Latex from 'react-latex-next'

interface SolutionWrapperProps {
  questionId: string
  resourceId: string
  chapterId: string
  topicId?: string
  questionType: QuestionType
  questionContent: string
  subQuestions?: {
    part: string;
    text: string;
    type: QuestionType;
    marks: number | null;
  }[]
  marks?: number | null
  existingSolution?: SolutionData
}

export function SolutionWrapper({
  questionId,
  resourceId,
  chapterId,
  topicId,
  questionType: initialType,
  questionContent,
  subQuestions,
  marks,
  existingSolution,
}: SolutionWrapperProps) {
  const [activeTab, setActiveTab] = useState('main')
  const [solutionTypes, setSolutionTypes] = useState<Record<string, QuestionType>>(() => {
    // Initial state should consider existing solutions
    const types: Record<string, QuestionType> = {
      main: existingSolution?.mainSolution?.type || initialType,
    };
    
    // Add types for sub-questions
    subQuestions?.forEach((sq) => {
      const existingSubSolution = existingSolution?.subSolutions?.find(s => s.part === sq.part);
      types[sq.part] = existingSubSolution?.solution?.type || sq.type;
    });
    
    return types;
  });
  
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    setSolutionTypes(prev => {
      const newTypes: Record<string, QuestionType> = {
        main: existingSolution?.mainSolution?.type || initialType,
      };
      
      subQuestions?.forEach((sq) => {
        const existingSubSolution = existingSolution?.subSolutions?.find(s => s.part === sq.part);
        newTypes[sq.part] = existingSubSolution?.solution?.type || sq.type;
      });
      
      return newTypes;
    });
  }, [initialType, subQuestions, existingSolution]);

  const handleSave = async (
    data: MCQSolution | StructuredStep[] | EssayOutlinePoint[] | ProofStep[],
    part?: string
  ) => {
    try {
      console.log("A. Starting handleSave");
      setIsLoading(true);
  
      console.log("B. Creating solution content", { type: part ? solutionTypes[part] : solutionTypes.main });
      const solutionContent: SolutionContent = {
        type: part ? solutionTypes[part] : solutionTypes.main,
        content: data
      };
      console.log("C. Solution content created:", solutionContent);
  
      console.log("D. Creating solution data");
      const solutionData: SolutionData = {
        questionId,
        mainSolution: part ? existingSolution?.mainSolution : solutionContent,
        subSolutions: part ? [
          ...(existingSolution?.subSolutions || []).filter(s => s.part !== part),
          { part, solution: solutionContent }
        ] : existingSolution?.subSolutions
      };
      console.log("E. Solution data created:", solutionData);
  
      console.log("F. Calling server action");
      let result;
      if (existingSolution?.id) {
        result = await updateSolution(existingSolution.id, solutionData);
      } else {
        result = await createSolution(solutionData);
      }
      console.log("G. Server action completed:", result);
  
      if (result.error) {
        console.error("H. Server returned error:", result.error);
        throw new Error(result.error);
      }
  
      toast({
        title: "Success",
        description: "Solution saved successfully"
      });
  
      console.log("I. Redirecting");
      router.push(getReturnPath());
    } catch (error) {
      console.error("J. Error in handleSave:", error);
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
    if (topicId) {
      return `/admin/resources/${resourceId}/chapters/${chapterId}/topics/${topicId}`;
    }
    return `/admin/resources/${resourceId}/chapters/${chapterId}/questions`;
  };

  const renderEditor = (part?: string) => {
    const solutionType = part ? solutionTypes[part] : solutionTypes.main;
    
    // Get the correct solution based on whether it's a main or sub solution
    let content;
    if (part) {
      const subSolution = existingSolution?.subSolutions?.find(s => s.part === part);
      content = subSolution?.solution?.content;
    } else {
      content = existingSolution?.mainSolution?.content;
    }

    switch (solutionType) {
      case 'MCQ':
        return (
          <MCQSolutionEditor
            initialData={content as MCQSolution}
            onSave={(data) => handleSave(data, part)}
          />
        );
      case 'STRUCTURED':
        return (
          <StructuredSolutionEditor
            initialData={content as StructuredStep[]}
            onSave={(data) => handleSave(data, part)}
          />
        );
      case 'ESSAY':
        return (
          <EssaySolutionEditor
            initialData={content as EssayOutlinePoint[]}
            onSave={(data) => handleSave(data, part)}
          />
        );
      case 'PROOF':
        return (
          <ProofSolutionEditor
            initialData={content as ProofStep[]}
            onSave={(data) => handleSave(data, part)}
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
          onClick={() => router.push(getReturnPath())}
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

            {subQuestions && subQuestions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sub Questions</h3>
                {subQuestions.map((sq) => (
                  <div key={sq.part} className="pl-4 border-l-2 border-muted">
                    <div className="mb-2">
                      <span className="inline-flex items-center justify-center bg-muted text-muted-foreground rounded-lg h-6 w-6 text-sm font-medium">
                        {sq.part}
                      </span>
                    </div>
                    <div className="space-y-2 ml-2">
                      <p className="text-gray-900"><Latex>{sq.text}</Latex></p>
                      {sq.marks && (
                        <p className="text-sm text-muted-foreground">
                          {sq.marks} marks
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="main">Main Question</TabsTrigger>
            {subQuestions?.map((sq) => (
              <TabsTrigger key={sq.part} value={sq.part}>
                Part {sq.part}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="main">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>Main Solution</CardTitle>
                  <Select
                    value={solutionTypes.main}
                    onValueChange={(value: QuestionType) =>
                      setSolutionTypes(prev => ({ ...prev, main: value }))
                    }
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
          </TabsContent>

          {subQuestions?.map((sq) => (
            <TabsContent key={sq.part} value={sq.part}>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>Solution for Part {sq.part}</CardTitle>
                    <Select
                      value={solutionTypes[sq.part]}
                      onValueChange={(value: QuestionType) =>
                        setSolutionTypes(prev => ({ ...prev, [sq.part]: value }))
                      }
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
                  {renderEditor(sq.part)}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}