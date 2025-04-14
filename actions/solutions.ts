"use server"

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { SolutionData } from '@/types/solution'
import { verifyAdmin } from './user'

export async function getQuestionWithSolutions(questionId: string) {
  try {
    const question = await prisma.question.findUnique({
      where: {
        id: questionId
      },
      include: {
        solutions: true,
        resource: {
          select: {
            type: true
          }
        }
      }
    })

    if (!question) {
      return { error: 'Question not found' }
    }

    return { question }
  } catch (error) {
    console.error('Failed to fetch question with solutions:', error)
    return { error: 'Failed to fetch question details' }
  }
}

export async function createSolution(data: SolutionData) {
  try {
    const { isAdmin, profile, error } = await verifyAdmin()

    if (!isAdmin && !profile) {
      return { error: error || 'Unauthorized - Admin access required' }
    }

    // Get the question to find its contentId for revalidation
    const question = await prisma.question.findUnique({
      where: { id: data.questionId },
      select: {
        resourceId: true,
        contentId: true
      }
    })

    if (!question) {
      return { error: 'Question not found' }
    }

    // First convert to JSON, then use as InputJsonValue
    // This avoids TypeScript errors with Prisma's JSON types
    const contentJson = JSON.parse(JSON.stringify(data.mainSolution?.content));

    const solution = await prisma.solution.create({
      data: {
        question: { connect: { id: data.questionId } },
        admin: { connect: { id: profile!.id } },
        content: contentJson,
        metrics: { views: 0, helpfulVotes: 0 },
        steps: []
      }
    })

    // Update the revalidation path to match the new structure
    revalidatePath(`/admin/resources/${question.resourceId}/contents/${question.contentId}`)
    
    return { solution }
  } catch (error) {
    console.error('Failed to create solution:', error)
    return { error: 'Failed to create solution' }
  }
}

export async function updateSolution(solutionId: string, data: Partial<SolutionData>) {
  try {
    const { isAdmin, profile, error } = await verifyAdmin()

    if (!isAdmin && !profile) {
      return { error: error || 'Unauthorized - Admin access required' }
    }

    // Find the solution and its related question info for revalidation
    const existingSolution = await prisma.solution.findUnique({
      where: { id: solutionId },
      include: { 
        question: {
          select: {
            id: true,
            resourceId: true,
            contentId: true
          }
        }
      }
    })
    
    if (!existingSolution) {
      return { error: 'Solution not found' }
    }

    // First convert to JSON, then use as InputJsonValue
    // This avoids TypeScript errors with Prisma's JSON types
    const contentJson = JSON.parse(JSON.stringify(data.mainSolution?.content));

    const solution = await prisma.solution.update({
      where: { id: solutionId },
      data: {
        content: contentJson
      }
    })

    // Update the revalidation path to match the new structure
    revalidatePath(`/admin/resources/${existingSolution.question.resourceId}/contents/${existingSolution.question.contentId}`)
    
    return { solution }
  } catch (error) {
    console.error('Failed to update solution:', error)
    return { error: 'Failed to update solution' }
  }
}