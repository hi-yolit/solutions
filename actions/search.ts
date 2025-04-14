// actions/search.ts
'use server'

import prisma from '@/lib/prisma'
import { ResourceType, Prisma } from '@prisma/client'

interface SearchParams {
    query: string
    type?: 'ALL' | 'QUESTIONS' | 'TEXTBOOKS' | 'PAST_PAPERS'
    page?: number
    limit?: number
}

export async function searchResources({
    query,
    type = 'ALL',
    page = 1,
    limit = 10
}: SearchParams) {
    try {
        console.log('Search started with query:', query)
        const skip = (page - 1) * limit

        // Base resource where clause
        const baseWhere: Prisma.ResourceWhereInput = {
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { subject: { contains: query, mode: 'insensitive' } },
                { publisher: { contains: query, mode: 'insensitive' } }
            ]
        }

        // Add type filter if specified
        let whereClause: Prisma.ResourceWhereInput = { ...baseWhere }
        if (type === 'TEXTBOOKS') {
            whereClause = {
                ...baseWhere,
                type: 'TEXTBOOK'
            }
        } else if (type === 'PAST_PAPERS') {
            whereClause = {
                ...baseWhere,
                type: 'PAST_PAPER'
            }
        }

        // Get resources
        const resources = await prisma.resource.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: { questions: true }
                }
            },
            skip,
            take: limit,
            orderBy: { updatedAt: 'desc' }
        })

        console.log('Found resources:', resources.length)

        // Get questions if type is ALL or QUESTIONS
        let questions: Array<any> = []
        if (type === 'ALL' || type === 'QUESTIONS') {
            questions = await prisma.question.findMany({
                where: {
                    OR: [
                        {
                            questionContent: {
                                path: ['mainQuestion'],
                                string_contains: query,
                            }
                        }
                    ]
                },
                include: {
                    resource: true,
                    content: true,
                    solutions: {
                        select: {
                            id: true
                        }
                    }
                },
                skip,
                take: limit
            })

            console.log('Found questions:', questions.length)
        }

        // Get total counts
        const totalResources = await prisma.resource.count({ where: whereClause })
        const totalPages = Math.ceil(totalResources / limit)

        const result = {
            resources,
            questions,
            totalResources,
            totalPages,
            currentPage: page
        }

        console.log('Search completed successfully')
        return {
            resources: result.resources || [],
            questions: result.questions || [],
            totalResources: result.totalResources || 0,
            totalPages: result.totalPages || 0,
            currentPage: result.currentPage || 0,
        };

    } catch (error) {
        console.error('Search error:', error)
        return {
            error: 'Failed to search',
            details: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}