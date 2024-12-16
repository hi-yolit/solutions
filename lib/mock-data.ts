import { QuestionType, SolutionData } from '@/types/solution'

export interface Question {
  id: string;
  number: string;
  type: QuestionType;
  content: string;
  marks?: number;
  hasSolution: boolean;
  status: 'active' | 'archived';
}

export const mockQuestions: Question[] = [
  {
    id: '1',
    number: '1.1',
    type: 'MCQ',
    content: 'If $f(x) = 2x + 3$, what is the value of $f(2)$?',
    marks: 2,
    hasSolution: true,
    status: 'active'
  },
  {
    id: '2',
    number: '1.2',
    type: 'STRUCTURED',
    content: 'Solve the quadratic equation $x^2 + 5x + 6 = 0$',
    marks: 5,
    hasSolution: false,
    status: 'active'
  },
  {
    id: '3',
    number: '2.1',
    type: 'ESSAY',
    content: 'Discuss the applications of derivatives in real life.',
    marks: 10,
    hasSolution: true,
    status: 'active'
  },
  {
    id: '4',
    number: '2.2',
    type: 'PROOF',
    content: 'Prove that the sum of the angles in a triangle is 180 degrees.',
    marks: 8,
    hasSolution: false,
    status: 'active'
  }
]

export const mockSolutions: Record<string, SolutionData> = {
  '1': {
    id: '1',
    questionId: '1',
    expertId: 'expert-1',
    solution: {
      type: 'MCQ',
      content: {
        correctOption: 'B',
        explanation: 'When $x = 2$, $f(2) = 2(2) + 3 = 7$',
        distractorExplanations: [
          { option: 'A', explanation: 'Common mistake: forgetting to add 3' },
          { option: 'B', explanation: 'Correct: $f(2) = 2(2) + 3 = 7$' },
          { option: 'C', explanation: 'Common mistake: multiplying by 3 instead of adding' }
        ],
        tip: 'Remember to follow the order of operations'
      }
    },
    verificationStatus: 'VERIFIED'
  },
  '3': {
    id: '3',
    questionId: '3',
    expertId: 'expert-1',
    solution: {
      type: 'ESSAY',
      content: [
        {
          title: 'Rate of Change',
          content: 'Derivatives measure instantaneous rate of change.',
          subPoints: ['Speed and velocity', 'Economic growth rates'],
          keyWords: ['rate', 'change', 'instantaneous'],
          marks: 3
        },
        {
          title: 'Optimization',
          content: 'Finding maximum and minimum values.',
          subPoints: ['Cost minimization', 'Profit maximization'],
          keyWords: ['maximum', 'minimum', 'optimal'],
          marks: 4
        }
      ]
    },
    verificationStatus: 'VERIFIED'
  }
}

// Mock API functions
export const mockApi = {
  getQuestion: async (id: string): Promise<Question> => {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
    const question = mockQuestions.find(q => q.id === id)
    if (!question) throw new Error('Question not found')
    return question
  },

  getSolution: async (questionId: string): Promise<SolutionData | null> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockSolutions[questionId] || null
  },

  saveSolution: async (solution: SolutionData): Promise<SolutionData> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newSolution = {
      ...solution,
      id: solution.id || Math.random().toString(36).substr(2, 9)
    }
    mockSolutions[solution.questionId] = newSolution
    return newSolution
  }
}