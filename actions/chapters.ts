'use server'

import  prisma  from '@/lib/prisma'
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

export async function addChapter(resourceId: string, data: { number: number; title?: string }) {
  try {
    const chapter = await prisma.chapter.create({
      data: {
        resourceId,
        number: data.number,
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