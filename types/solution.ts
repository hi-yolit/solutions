// types/solution.ts
import { Prisma, SolutionType } from "@prisma/client"

export type QuestionType = SolutionType

export interface SolutionContent extends Prisma.JsonObject {
  type: QuestionType;
  content: MCQSolution | StructuredStep[] | EssayOutlinePoint[] | ProofStep[];
  [key: string]: any; // Add index signature for Prisma JsonObject compatibility
}

export interface QuestionContent extends Prisma.JsonObject {
  mainQuestion: string;
  marks?: number | null;
  blocks?: ContentBlock[];
  [key: string]: any; // Add index signature for Prisma JsonObject compatibility
}

export interface ContentBlock {
  type: 'text' | 'image';
  content: string;
  imageData?: {
    url: string;
    caption?: string;
    position: 'above' | 'below' | 'inline';
  };
}

// MCQ Solution Types
export interface MCQSolution {
  correctOption: string;
  explanation: string;
  options: {
    id: string;
    label: string;
    content: string;
    explanation?: string;
  }[];
  distractorExplanations: {
    option: string;
    explanation: string;
  }[];
  tip?: string;
}

// Structured Solution Types
export interface StructuredStep {
  title: string;
  content: string;
  explanation?: string;
  marks?: number;
  hint?: string;
}

// Essay Solution Types
export interface EssayOutlinePoint {
  title: string;
  content: string;
  subPoints?: string[];
  keyWords?: string[];
  marks?: number;
  explanation?: string;
}

// Proof Solution Types
export interface ProofStep {
  title: string;
  statement: string;
  justification: string;
  hint?: string;
}

export interface DBSolution {
  id: string;
  questionId: string;
  content: Prisma.JsonValue;
}

export interface SolutionData {
  id?: string;
  questionId: string;
  mainSolution?: SolutionContent;
}

export interface QuestionWithSolution {
  id: string;
  type: QuestionType;
  content: {
    mainQuestion: string;
    marks?: number;
    blocks?: ContentBlock[];
  };
  solutions: DBSolution[];
}