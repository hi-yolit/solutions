'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getChapterWithTopics(chapterId: string) {
    try {
        const chapter = await prisma.chapter.findUnique({
            where: { id: chapterId },
            include: {
                topics: {
                    include: {
                        _count: {
                            select: {
                                questions: true
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

export async function addTopic(chapterId: string, data: { number: string; title?: string }) {
    try {
        const topic = await prisma.topic.create({
            data: {
                chapterId,
                title: data.title || null,
            }
        })

        revalidatePath(`/admin/resources/[resourceId]/chapters/${chapterId}`)
        return { topic }
    } catch (error) {
        console.error('Failed to create topic:', error)
        return { error: 'Failed to create topic' }
    }
}