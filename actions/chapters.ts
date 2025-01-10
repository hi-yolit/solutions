'use server'

import  prisma  from '@/lib/prisma'
import { ChapterFormValues } from '@/lib/validations/chapter'
import { revalidatePath } from 'next/cache'

export async function getResourceWithChapters(resourceId: string) {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        chapters: {
          orderBy: {
            number: 'asc'
          }
        }
      }
    })
    return { resource }
  } catch (error) {
    console.error('Failed to fetch resource:', error)
    return { error: 'Failed to fetch resource' }
  }
}

export async function addChapter(resourceId: string, data: { number?: number; title?: string }) {
  try {
    const chapter = await prisma.chapter.create({
      data: {
        resourceId,
        number: data.number || null,
        title: data.title || null,
      }
    })

    revalidatePath(`/admin/resources/${resourceId}`)
    return { chapter }
  } catch (error) {
    console.error('Failed to create chapter:', error)
    return { error: 'Failed to create chapter' }
  }
}

export async function updateChapter(chapterId: string, data: ChapterFormValues) {
  try {
    const chapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        number: data.number,
        title: data.title
      }
    })
    return { chapter }
  } catch (error) {
    return { error: "Failed to update chapter" }
  }
}

export async function deleteChapter(chapterId: string) {
  try {
    await prisma.chapter.delete({
      where: { id: chapterId }
    })
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete chapter" }
  }
}