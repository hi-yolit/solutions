'use server'

import prisma from '@/lib/prisma'
import { QuestionFormValues } from '@/types/question';
import { SolutionType, Prisma, QuestionStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

// Make sure content follows Prisma's JSON type
interface QuestionContent extends Prisma.JsonObject {
  mainQuestion: string;
  marks?: number | null;
  blocks?: any[];
  subQuestions?: {
    part: string;
    text: string;
    marks: number | null;
    blocks?: any[];
  }[];
  [key: string]: any; // Add index signature
}

interface CreateQuestionInput {
  questionNumber: string;
  pageNumber?: number | null;
  type: SolutionType;
  content: QuestionContent;
}

// Example data for testing
const exampleQuestions: CreateQuestionInput[] = [
  {
    questionNumber: "1.1",
    type: "STRUCTURED",
    content: {
      mainQuestion: "Solve the following quadratic equation:",
      marks: 5,
      subQuestions: [
        { part: "a", text: "Solve by factorization: 2x² + 5x - 12 = 0", marks: 3 },
        { part: "b", text: "Verify your solutions", marks: 2 }
      ]
    }
  },
  {
    questionNumber: "1.2",
    type: "MCQ",
    content: {
      mainQuestion: "What is the derivative of x²?",
      marks: 2
    }
  }
]

export async function addQuestion(
  resourceId: string,
  chapterId: string,
  topicId: string | undefined,
  data: CreateQuestionInput
) {
  try {
    const questionData: Prisma.QuestionCreateInput = {
      resource: { connect: { id: resourceId } },
      chapter: { connect: { id: chapterId } },
      topic: topicId ? { connect: { id: topicId } } : undefined,
      questionNumber: data.questionNumber,
      pageNumber: data.pageNumber,
      type: data.type,
      content: data.content as Prisma.InputJsonValue,
    }

    const question = await prisma.question.create({
      data: questionData
    })

    const path = topicId 
      ? `/admin/resources/${resourceId}/chapters/${chapterId}/topics/${topicId}`
      : `/admin/resources/${resourceId}/chapters/${chapterId}/questions`;
    
    revalidatePath(path)
    return { question }
  } catch (error) {
    console.error('Failed to create question:', error)
    return { error: 'Failed to create question' }
  }
}

export async function getTopicWithQuestions(topicId: string) {
  try {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        questions: {
          orderBy: {
            questionNumber: 'asc'
          },
          include: {
            solutions: {
              select: {
                id: true,
              }
            }
          }
        }
      }
    })

    return { topic }
  } catch (error) {
    console.error('Failed to fetch topic:', error)
    return { error: 'Failed to fetch topic' }
  }
}

export async function getChapterWithQuestions(chapterId: string) {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        questions: {
          orderBy: {
            questionNumber: 'asc'
          },
          include: {
            solutions: {
              select: {
                id: true,
              }
            }
          }
        }
      }
    })

    return { chapter }
  } catch (error) {
    console.error('Failed to fetch chapter:', error)
    return { error: 'Failed to fetch chapter' }
  }
}

// actions/questions.ts
export async function updateQuestionStatus(questionId: string, status: QuestionStatus) {
  try {
    const question = await prisma.question.update({
      where: { id: questionId },
      data: { status }
    })

    revalidatePath(`/admin/resources/*/chapters/*`)
    return { question }
  } catch (error) {
    console.error('Failed to update question status:', error)
    return { error: 'Failed to update question status' }
  }
}

// actions/questions.ts
export async function updateQuestion(questionId: string, data: QuestionFormValues) {
  try {
    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        questionNumber: data.questionNumber,
        type: data.type,
        status: data.status,
        pageNumber: data.pageNumber,
        content: data.content
      }
    });

    revalidatePath(`/admin/resources/*/chapters/*`);
    return { question };
  } catch (error) {
    console.error('Failed to update question:', error);
    return { error: 'Failed to update question' };
  }
}

// For testing purposes
export async function seedQuestions(resourceId: string, chapterId: string, topicId: string) {
  try {
    for (const question of exampleQuestions) {
      const questionData: Prisma.QuestionCreateInput = {
        resource: { connect: { id: resourceId } },
        chapter: { connect: { id: chapterId } },
        topic: { connect: { id: topicId } },
        questionNumber: question.questionNumber,
        type: question.type,
        content: question.content as Prisma.InputJsonValue,
      }

      await prisma.question.create({
        data: questionData
      })
    }
    return { success: true }
  } catch (error) {
    console.error('Failed to seed questions:', error)
    return { error: 'Failed to seed questions' }
  }
}