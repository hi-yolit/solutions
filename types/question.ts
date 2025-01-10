// types/question.ts
import { SolutionType, Chapter, Question, Prisma, QuestionStatus } from '@prisma/client'

export interface QuestionContent extends Prisma.JsonObject {
  mainQuestion: string;
  blocks: ContentBlock[];
  marks?: number | null;
  subQuestions?: SubQuestion[];
  [key: string]: any; // This makes it compatible with JsonObject
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

export interface SubQuestion {
  part: string;
  text: string;
  type: SolutionType; // Add type for subquestions
  marks: number | null;
  blocks: ContentBlock[];
}

export interface QuestionWithSolutions extends Omit<Question, 'content'> {
  content: QuestionContent;
  solutions: {
    id: string;
  }[]; // Removed verificationStatus
}

export interface ChapterWithQuestions extends Chapter {
  questions: QuestionWithSolutions[];
}

export interface QuestionFormValues {
  questionNumber: string;
  type: SolutionType;
  pageNumber?: number | null;
  status: QuestionStatus; // Add status field
  content: QuestionContent;
}

export interface AddQuestionDialogProps {
  resourceId: string;
  chapterId: string;
  topicId?: string;
  questionToEdit?: Question | null; // Add for editing support
  open: boolean;
  onOpenChange: (open: boolean) => void;
}