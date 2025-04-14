// types/resource.ts
import { ContentType, Prisma, ResourceType as PrismaResourceType } from "@prisma/client";
export type ResourceType = PrismaResourceType;

export interface ContentWithChildren {
  id: string;
  title: string | null;
  type: ContentType;
  number: string | null;
  pageNumber: number | null;
  order: number;
  children?: ContentWithChildren[];
  questions?: QuestionWithSolutions[];
  _count?: {
    children?: number;
    questions?: number;
  };
}

export interface ContentWithQuestions {
  id: string;
  title: string | null;
  type: ContentType;
  number: string | null;
  pageNumber: number | null;
  order: number;
  questions: QuestionWithSolutions[];
  _count?: {
    questions: number;
  };
}

export interface QuestionWithSolutions {
  id: string;
  questionNumber: string;
  exerciseNumber: number | null;
  type: string;
  order: number;
  solutions: SolutionBrief[];
  questionContent: Prisma.JsonValue;  
  contentId: string;

}

interface SolutionBrief {
  id: string;
}

export interface ResourceWithContent {
  id: string;
  title: string;
  type: ResourceType;
  subject: string;
  grade: number;
  coverImage: string | null;
  edition: string | null;
  publisher: string | null;
  term: number | null;
  year: number | null;
  contents: ContentWithChildren[];
}