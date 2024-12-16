export type QuestionType = 'MCQ' | 'STRUCTURED' | 'ESSAY' | 'PROOF';

export interface ContentBlock {
  type: 'text' | 'image';
  content: string;
  imageData?: ImageData;
}

export interface ImageData {
  url: string;
  caption?: string;
  position: 'above' | 'below' | 'inline';
}

// MCQ Solution Types
export interface MCQOption {
  id: string;
  label: string;
  content: string;
  explanation?: string;
}

export interface DistractorExplanation {
  option: string;
  explanation: string;
}

export interface MCQSolution {
  correctOption: string;
  explanation: string;
  distractorExplanations?: DistractorExplanation[];
  options?: MCQOption[];
  tip?: string;
}

// Form specific type
export interface MCQFormValues {
  options: MCQOption[];
  correctOptionId: string;
  explanation: string;
  tip?: string;
}

// Structured Solution Types
export interface StructuredStep {
  title: string;
  content: string;
  contentBlocks: ContentBlock[];
  explanation?: string;
  marks?: number;
  tip?: string;
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
  latex?: string;
  tip?: string;
}

export interface SolutionContent {
  type: QuestionType;
  content: MCQSolution | StructuredStep[] | EssayOutlinePoint[] | ProofStep[];
}

export interface SolutionData {
  id?: string;
  questionId: string;
  expertId: string;
  solution: SolutionContent;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}