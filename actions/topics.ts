'use server'

import prisma from '@/lib/prisma'
import { TopicFormValues } from '@/lib/validations/topic'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from './user'

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
                    },
                    orderBy: {
                        number: 'asc'
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

        const { isAdmin, profile, error } = await verifyAdmin()

        if (!isAdmin && !profile) {
            return { error: error || 'Unauthorized - Admin access required' }
        }

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

export async function deleteTopic(topicId: string) {
    try {

        const { isAdmin, profile, error } = await verifyAdmin()

        if (!isAdmin && !profile) {
            return { error: error || 'Unauthorized - Admin access required' }
        }

        await prisma.topic.delete({
            where: { id: topicId }
        })
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete chapter" }
    }
}


export async function updateTopic(topicId: string, data: TopicFormValues) {
    try {

        const { isAdmin, profile, error } = await verifyAdmin()

        if (!isAdmin && !profile) {
            return { error: error || 'Unauthorized - Admin access required' }
        }

        const chapter = await prisma.topic.update({
            where: { id: topicId },
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