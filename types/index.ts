// src/types/index.ts
export type CurriculumType = 'CAPS' | 'IEB'

export interface Subject {
  name: string
  grades: number[]
  curriculumType: CurriculumType
}