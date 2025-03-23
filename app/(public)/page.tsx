'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { SearchBox } from '@/components/search-box'
import { SubjectResources } from '@/components/subject-resources'
import { ResourceStatus, Resource } from '@prisma/client'
import { useAuth } from '@/contexts/auth-context' 
import { getResources, getSuggestedSubjects } from '@/actions/resources' // Import server actions

export default function ClientHomePage() {
  const [subjects, setSubjects] = useState<string[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [resourcesBySubject, setResourcesBySubject] = useState<Record<string, Resource[]>>({})
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  useEffect(() => {
    // If auth is still loading, wait for it
    if (authLoading) return
    
    // If user is authenticated, redirect to home
    if (user) {
      router.push('/home')
      return
    }
    
    // Otherwise, fetch public content using server actions
    async function loadPublicContent() {
      setDataLoading(true)
      try {
        // Using the server actions from your original code
        const [subjectsResult, resourcesResult] = await Promise.all([
          getSuggestedSubjects(),
          getResources({
            status: ResourceStatus.LIVE,
            limit: 15,
          })
        ])
        
        // Handle subjects
        if (subjectsResult?.error) {
          console.error('Error fetching subjects:', subjectsResult.error)
        } else {
          setSubjects(subjectsResult?.subjects || [])
        }
        
        // Handle resources
        if (resourcesResult?.error) {
          console.error('Error fetching resources:', resourcesResult.error)
        } else {
          const fetchedResources = resourcesResult?.resources || []
          setResources(fetchedResources)
          
          // Group resources by subject
          const grouped = fetchedResources.reduce((acc: Record<string, Resource[]>, resource: Resource) => {
            const subject = resource.subject
            if (!acc[subject]) {
              acc[subject] = []
            }
            acc[subject].push(resource)
            return acc
          }, {})
          
          setResourcesBySubject(grouped)
        }
      } catch (error) {
        console.error('Error loading public content:', error)
        setDataError('Failed to load content. Please try again later.')
      } finally {
        setDataLoading(false)
      }
    }
    
    loadPublicContent()
  }, [user, authLoading, router])

  // Show loading state
  if (authLoading || dataLoading) {
    return (
      <div className="max-w-[64rem] mx-auto px-4 py-12">
        <Navbar />
        <div className="text-center my-12">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (dataError) {
    return (
      <div className="max-w-[64rem] mx-auto px-4 py-12">
        <Navbar />
        <div className="text-center my-12">
          <p className="text-red-500">{dataError}</p>
        </div>
      </div>
    )
  }

  // Show public content
  return (
    <div className="max-w-[64rem] mx-auto px-4 py-12">
      <Navbar />
      <div className="text-center my-12">
        <h1 className="text-5xl font-bold mb-4">
          Find textbook solutions you can trust
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Access step-by-step solutions for your CAPS and IEB textbooks and past
          papers
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBox />
        </div>
      </div>

      {/* Browse Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Browse by subject</h2>
        {subjects.length > 0 && Object.keys(resourcesBySubject).length > 0 && (
          <SubjectResources
            subjects={subjects}
            resourcesBySubject={resourcesBySubject}
          />
        )}
      </div>
    </div>
  )
}