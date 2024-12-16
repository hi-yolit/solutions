'use server'

import prisma from '@/lib/prisma'
import { ResourceFormValues } from '@/lib/validations/resource'
import { Resource } from '@prisma/client'
import { revalidatePath } from 'next/cache'

type ResourcesResponse = {
    resources?: Resource[]
    error?: string
}

type SubjectsResponse = {
    subjects: string[]
    error?: string
}

export async function getResources(): Promise<ResourcesResponse> {
    try {
        const resources = await prisma.resource.findMany({
            orderBy: {
                title: 'asc'
            }
        })
        return { resources }
    } catch (error) {
        console.error('Failed to fetch resources:', error)
        return { error: 'Failed to fetch resources' }
    }
}

export async function addResource(data: ResourceFormValues) {
    try {
        const resource = await prisma.resource.create({
            data: {
                title: data.title,
                type: data.type,
                subject: data.subject,
                grade: data.grade,
                year: data.year,
                publisher: data.publisher,
                curriculum: data.curriculum,
            }
        })

        revalidatePath('/admin/resources')
        return { resource }
    } catch (error) {
        return { error: 'Failed to create resource' }
    }
}

export async function getSuggestedSubjects(query: string = ''): Promise<SubjectsResponse> {
    try {
      const results = await prisma.resource.findMany({
        where: query ? {
          subject: {
            contains: query,
            mode: 'insensitive',
          },
        } : undefined,
        select: {
          subject: true,
        },
        distinct: ['subject'],
        orderBy: {
          subject: 'asc',
        },
      }) || [];
      
      // Ensure we always return an array of strings
      const subjects = results.map(r => r.subject).filter(Boolean)
      
      return {
        subjects
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
      return { subjects: [] }
    }
  }