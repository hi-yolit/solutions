"use server"

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { SolutionData, QuestionContent } from '@/types/solution'
import { Prisma } from '@prisma/client'
import { verifyAdmin } from './user'

export async function getQuestionWithSolutions(questionId: string) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        solutions: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    })

    return {
      question: question ? {
        ...question,
        content: question.content as QuestionContent
      } : null
    }
  } catch (error) {
    console.error('Failed to fetch question:', error)
    return { error: 'Failed to fetch question' }
  }
}

export async function createSolution(data: SolutionData) {

  try {

    const { isAdmin, profile, error } = await verifyAdmin()

    if (!isAdmin && !profile) {
      return { error: error || 'Unauthorized - Admin access required' }
    }

    const solutionContent = {
      mainSolution: data.mainSolution,
      subSolutions: data.subSolutions
    }

    const solution = await prisma.solution.create({
      data: {
        question: { connect: { id: data.questionId } },
        admin: { connect: { id: profile!.id } },
        content: solutionContent as Prisma.InputJsonValue,
        metrics: { views: 0, helpfulVotes: 0 } as Prisma.InputJsonValue,
        steps: []
      }
    })

    revalidatePath(`/admin/resources/*/chapters/*/questions/${data.questionId}`)
    return { solution }
  } catch (error) {
    console.error('Failed to create solution:', error)
    return { error: 'Failed to create solution' }
  }
}

export async function updateSolution(solutionId: string, data: Partial<SolutionData>) {

  const { isAdmin, profile, error } = await verifyAdmin()

  if (!isAdmin && !profile) {
    return { error: error || 'Unauthorized - Admin access required' }
  }

  try {
    const solutionContent = {
      mainSolution: data.mainSolution,
      subSolutions: data.subSolutions
    }

    const solution = await prisma.solution.update({
      where: { id: solutionId },
      data: {
        content: solutionContent as Prisma.InputJsonValue,
      }
    })

    revalidatePath(`/admin/resources/*/chapters/*/questions/${data.questionId}`)
    return { solution }
  } catch (error) {
    console.error('Failed to update solution:', error)
    return { error: 'Failed to update solution' }
  }
}