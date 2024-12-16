// types/questions.ts
export type QuestionType = 'MCQ' | 'STRUCTURED' | 'ESSAY' | 'PROOF' | 'DRAWING'

interface BaseSolution {
  id?: string
  expertNotes?: string
  status: 'draft' | 'published'
}

export interface MCQSolution extends BaseSolution {
  type: 'MCQ'
  correctOption: string
  explanation: string
  optionExplanations: Record<string, string>
}

export interface StructuredSolution extends BaseSolution {
  type: 'STRUCTURED'
  steps: {
    title: string
    content: string
    explanation?: string
    tip?: string
  }[]
  finalAnswer: string
}

export interface EssaySolution extends BaseSolution {
  type: 'ESSAY'
  modelAnswer: string
  keyPoints: string[]
  markingRubric: {
    content: number
    structure: number
    language: number
  }
}

export interface ProofSolution extends BaseSolution {
  type: 'PROOF'
  steps: {
    statement: string
    reason: string
    explanation?: string
  }[]
  conclusion: string
}

export interface DrawingSolution extends BaseSolution {
  type: 'DRAWING'
  steps: {
    instruction: string
    explanation?: string
  }[]
  markingPoints: string[]
}

export type Solution = 
  | MCQSolution 
  | StructuredSolution 
  | EssaySolution 
  | ProofSolution 
  | DrawingSolution