// src/types/resource.ts
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