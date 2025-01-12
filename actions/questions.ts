'use server'

import prisma from '@/lib/prisma'
import { QuestionFormValues } from '@/types/question';
import { SolutionType, Prisma, QuestionStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from './user';

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
  exerciseNumber?: number | null;
  type: SolutionType;
  content: QuestionContent;
}

export async function addQuestion(
  resourceId: string,
  chapterId: string,
  topicId: string | undefined,
  data: CreateQuestionInput
) {
  try {

    const { isAdmin, error } = await verifyAdmin()

    if (!isAdmin) {
      return { error: error || 'Unauthorized - Admin access required' }
    }

    const questionData: Prisma.QuestionCreateInput = {
      resource: { connect: { id: resourceId } },
      chapter: { connect: { id: chapterId } },
      topic: topicId ? { connect: { id: topicId } } : undefined,
      questionNumber: data.questionNumber,
      exerciseNumber: data.exerciseNumber,
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
            },
            resource: {
              select: {
                type: true
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
          orderBy: [
            {
              questionNumber: 'asc',
            },
            {
              exerciseNumber: 'asc',
            },
          ],
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

export async function updateQuestionStatus(questionId: string, status: QuestionStatus) {
  try {

    const { isAdmin, error } = await verifyAdmin()

    if (!isAdmin) {
      return { error: error || 'Unauthorized - Admin access required' }
    }

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

export async function updateQuestion(questionId: string, data: QuestionFormValues) {
  try {

    const { isAdmin, error } = await verifyAdmin()

    if (!isAdmin) {
      return { error: error || 'Unauthorized - Admin access required' }
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        questionNumber: data.questionNumber,
        exerciseNumber: data.exerciseNumber,
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

export async function deleteQuestion(questionId: string) {
  try {

    const { isAdmin, error } = await verifyAdmin()

    if (!isAdmin) {
      return { error: error || 'Unauthorized - Admin access required' }
    }

    await prisma.question.delete({
      where: { id: questionId }
    })
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete question" }
  }
}
