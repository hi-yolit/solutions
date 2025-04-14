'use server'

import prisma from '@/lib/prisma'
import { QuestionFormValues } from '@/types/question';
import { SolutionType, Prisma, QuestionStatus, Question } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from './user';

export async function addQuestion(
  resourceId: string, 
  contentId: string, 
  data: {
    questionNumber: string;
    type: SolutionType;
    status?: QuestionStatus;
    exerciseNumber?: number | null;
    order?: number;
    content: any;
  }
) {
  try {
    const { isAdmin, error } = await verifyAdmin()

    if (!isAdmin) {
      return { error: error || 'Unauthorized - Admin access required' }
    }

    const content = await prisma.content.findUnique({
      where: { id: contentId }
    })

    if (!content) {
      return { error: "Content not found" }
    }

    const question = await prisma.question.create({
      data: {
        resourceId,
        contentId,
        questionNumber: data.questionNumber,
        type: data.type,
        status: data.status || 'DRAFT',
        exerciseNumber: data.exerciseNumber || null,
        order: data.order || 0, // Use provided order or default to 0
        questionContent: data.content // Here's the issue - mapping content to questionContent
      }
    })

    revalidatePath(`/admin/resources/${resourceId}/contents/${contentId}`)
    return { question }
  } catch (error) {
    console.error('Failed to create question:', error)
    return { error: 'Failed to create question' }
  }
}

export async function updateQuestion(
  questionId: string, 
  data: {
    questionNumber: string;
    type: SolutionType;
    status?: QuestionStatus;
    exerciseNumber?: number | null;
    order?: number;
    content: any;
  }
) {
  try {
    const { isAdmin, error } = await verifyAdmin()

    if (!isAdmin) {
      return { error: error || 'Unauthorized - Admin access required' }
    }

    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId }
    })

    if (!existingQuestion) {
      return { error: "Question not found" }
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        questionNumber: data.questionNumber,
        type: data.type,
        status: data.status,
        exerciseNumber: data.exerciseNumber,
        order: data.order ?? existingQuestion.order, // Preserve existing order if not provided
        questionContent: data.content
      }
    })

    if (existingQuestion.contentId) {
      revalidatePath(`/admin/resources/${existingQuestion.resourceId}/contents/${existingQuestion.contentId}`)
    }

    return { question }
  } catch (error) {
    console.error('Failed to update question:', error)
    return { error: 'Failed to update question' }
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

export async function getQuestionsForContent(contentId: string) {
  try {
    const questions = await prisma.question.findMany({
      where: {
        contentId: contentId
      },
      include: {
        solutions: {
          select: {
            id: true
          }
        },
        resource: {
          select: {
            type: true
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { questionNumber: 'asc' }
      ]
    })

    return { questions }
  } catch (error) {
    console.error('Failed to fetch questions:', error)
    return { questions: [], error: 'Failed to fetch questions' }
  }
}

export async function getQuestionWithSolution(questionId: string) {
  try {
    const question = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
      include: {
        solutions: true,
        content: {
          select: {
            id: true,
            number: true,
            title: true,
            type: true,
          }
        },
      },
    });

    if (!question) {
      return { error: 'Question not found' };
    }

    return { question };
  } catch (error) {
    console.error("Error fetching question:", error);
    return { 
      error: `Failed to fetch question: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    };
  }
}

export async function getQuestionsForContentNav(contentId: string) {
  try {
    const questions = await prisma.question.findMany({
      where: {
        contentId: contentId,
      },
      select: {
        id: true,
        questionNumber: true,
        exerciseNumber: true,
      },
      orderBy: {
        order: 'asc', // Or another field that determines the order
      },
    });
    console.log(`Found ${questions.length} questions for contentId ${contentId}`);
    return questions;
  } catch (error) {
    console.error("Error fetching questions for content:", error);
    throw new Error(
      `Failed to fetch questions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Get the next content ID in the same resource
export async function getNextContentId(currentContentId: string) {
  try {
    // First, get the current content to find its resourceId and order
    const currentContent = await prisma.content.findUnique({
      where: { id: currentContentId },
      select: { 
        resourceId: true, 
        order: true,
        parentId: true
      }
    });
    
    if (!currentContent) {
      throw new Error("Current content not found");
    }
    
    // If this is a child content, try to find a next sibling
    if (currentContent.parentId) {
      const nextSibling = await prisma.content.findFirst({
        where: {
          parentId: currentContent.parentId,
          order: { gt: currentContent.order }
        },
        orderBy: { order: 'asc' },
        select: { id: true }
      });
      
      if (nextSibling) {
        return nextSibling.id;
      }
      
      // If no next sibling, go up to parent and get its next sibling
      const parent = await prisma.content.findUnique({
        where: { id: currentContent.parentId },
        select: { 
          parentId: true,
          order: true 
        }
      });
      
      if (parent?.parentId) {
        const parentNextSibling = await prisma.content.findFirst({
          where: {
            parentId: parent.parentId,
            order: { gt: parent.order }
          },
          orderBy: { order: 'asc' },
          select: { id: true }
        });
        
        if (parentNextSibling) {
          return parentNextSibling.id;
        }
      }
    }
    
    // Find the next content at the same level (same parent or top level)
    const nextContent = await prisma.content.findFirst({
      where: {
        resourceId: currentContent.resourceId,
        parentId: currentContent.parentId,
        order: { gt: currentContent.order }
      },
      orderBy: { order: 'asc' },
      select: { id: true }
    });
    
    if (nextContent) {
      return nextContent.id;
    }
    
    // If no next content at the same level, check if this is top level
    // and if so, return null (no next section)
    if (!currentContent.parentId) {
      return null;
    }
    
    // Otherwise, it's a leaf node, so return the parent's next sibling
    const parentContent = await prisma.content.findUnique({
      where: { id: currentContent.parentId },
      select: { 
        parentId: true,
        order: true 
      }
    });
    
    if (!parentContent) {
      return null;
    }
    
    const parentNextSibling = await prisma.content.findFirst({
      where: {
        parentId: parentContent.parentId,
        order: { gt: parentContent.order }
      },
      orderBy: { order: 'asc' },
      select: { id: true }
    });
    
    return parentNextSibling?.id || null;
  } catch (error) {
    console.error("Error finding next content:", error);
    return null;
  }
}

// Get the previous content ID in the same resource
export async function getPreviousContentId(currentContentId: string) {
  try {
    // First, get the current content to find its resourceId and order
    const currentContent = await prisma.content.findUnique({
      where: { id: currentContentId },
      select: { 
        resourceId: true, 
        order: true,
        parentId: true
      }
    });
    
    if (!currentContent) {
      throw new Error("Current content not found");
    }
    
    // If this is a child content, try to find a previous sibling
    if (currentContent.parentId) {
      const prevSibling = await prisma.content.findFirst({
        where: {
          parentId: currentContent.parentId,
          order: { lt: currentContent.order }
        },
        orderBy: { order: 'desc' },
        select: { id: true }
      });
      
      if (prevSibling) {
        return prevSibling.id;
      }
      
      // If no previous sibling, return the parent
      return currentContent.parentId;
    }
    
    // Find the previous content at the same level (same parent or top level)
    const prevContent = await prisma.content.findFirst({
      where: {
        resourceId: currentContent.resourceId,
        parentId: currentContent.parentId,
        order: { lt: currentContent.order }
      },
      orderBy: { order: 'desc' },
      select: { id: true }
    });
    
    return prevContent?.id || null;
  } catch (error) {
    console.error("Error finding previous content:", error);
    return null;
  }
}

// Get the first question ID for a given content
export async function getFirstQuestionId(contentId: string) {
  try {
    const firstQuestion = await prisma.question.findFirst({
      where: { contentId: contentId },
      orderBy: { order: 'asc' },
      select: { id: true }
    });
    
    return firstQuestion?.id || null;
  } catch (error) {
    console.error("Error finding first question:", error);
    return null;
  }
}

// Get the last question ID for a given content
export async function getLastQuestionId(contentId: string) {
  try {
    const lastQuestion = await prisma.question.findFirst({
      where: { contentId: contentId },
      orderBy: { order: 'desc' },
      select: { id: true }
    });
    
    return lastQuestion?.id || null;
  } catch (error) {
    console.error("Error finding last question:", error);
    return null;
  }
}


