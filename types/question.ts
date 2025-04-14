// types/question.ts
import { SolutionType, Question, Prisma, QuestionStatus } from '@prisma/client'
import { ResourceType } from './resource';

// types/question.ts
import { JsonValue } from '@prisma/client/runtime/library';

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
  }[]; 
  resource?: {
    type: ResourceType;
  };// Removed verificationStatus
}

export interface QuestionFormValues {
  questionNumber: string;
  type: SolutionType;
  pageNumber?: number | null;
  exerciseNumber?: number | null;
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


// Define the StepContent type to match what ExerciseContent expects
export type StepContent = {
  hint?: string;
  content: string;
  title?: string;
  marks?: number;
  explanation?: string;
};

// Define the Question type to match the transformed question from Prisma
export interface PrismaQuestion {
  id: string;
  contentId: string | null;
  questionNumber: string;
  exerciseNumber: number | null;
  solutions: {
    id: string;
    content: JsonValue;
    questionId: string;
    createdAt: Date;
    updatedAt: Date;
    adminId: string;
    steps: JsonValue[];
    metrics: JsonValue;
  }[];
}

// Define the transformed Question type for the ExerciseContent component
export interface TransformedQuestion {
  id: string;
  contentId?: string;
  questionNumber: string;
  exerciseNumber?: number | null;
  solutions: {
    steps: StepContent[];
  }[];
}

// Helper function to transform Prisma question to component-friendly format
export function transformQuestion(question: PrismaQuestion, contentId: string): TransformedQuestion {
  return {
    id: question.id,
    contentId: contentId,
    questionNumber: question.questionNumber,
    exerciseNumber: question.exerciseNumber,
    solutions: question.solutions.map(solution => {
      // Extract steps from the content field instead of steps field
      let contentSteps: StepContent[] = [];
      
      try {
        // Content field might contain the steps as a JSON string or object
        const contentData = typeof solution.content === 'string' 
          ? JSON.parse(solution.content)
          : solution.content;
          
        // Try different possible structures
        if (contentData && contentData.steps) {
          // If steps are in content.steps
          contentSteps = contentData.steps;
        } else if (contentData && Array.isArray(contentData)) {
          // If content itself is an array of steps
          contentSteps = contentData;
        } else if (contentData && contentData.content && Array.isArray(contentData.content)) {
          // If steps are in content.content
          contentSteps = contentData.content;
        }
      } catch (error) {
        console.error('Error parsing solution content:', error);
      }
      
      // Convert to proper StepContent format
      return {
        steps: contentSteps.map(step => {
          const typedStep = step as any;
          return {
            hint: typedStep.hint,
            content: typedStep.content || '',
            title: typedStep.title,
            marks: typedStep.marks,
            explanation: typedStep.explanation,
          };
        })
      };
    })
  };
}