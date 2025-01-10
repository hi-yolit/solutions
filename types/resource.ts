// src/types/resource.ts
import { Chapter, Question, Solution, Topic } from "@prisma/client"
export type ResourceType = 'TEXTBOOK' | 'PAST_PAPER' | 'STUDY_GUIDE'
export type CurriculumType = 'CAPS' | 'IEB'

export interface Resource {
  id: string
  title: string
  type: ResourceType
  subject: string
  grade: number
  curriculum: CurriculumType
  year: number
  publisher?: string
  status: 'active' | 'inactive'
}

export interface TopicWithQuestions extends Topic {
  questions: QuestionWithSolutions[];
}

export interface QuestionWithSolutions extends Question {
  solutions: Solution[];
}

export interface ChapterWithContent extends Chapter {
  topics: TopicWithQuestions[];
  questions: QuestionWithSolutions[];
}

export interface ResourceWithContent extends Resource {
  chapters: ChapterWithContent[];
}