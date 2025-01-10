// src/app/page.tsx
import { getResources, getSuggestedSubjects } from '@/actions/resources'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { BookOpen, CheckCircle2, BookCheck } from 'lucide-react'
import { SubjectResources } from '@/components/subject-resources'
import { Resource } from '@prisma/client'

export default async function Home() {
  const { subjects } = await getSuggestedSubjects()
  const { resources, total, pages } = await getResources({
    limit: 6
  }) || { resources: [], total: 0, pages: 0 }
  
  const resourcesBySubject = resources.reduce((acc, resource) => {
    const subject = resource.subject;
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          Find textbook solutions you can trust
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Access step-by-step solutions for your CAPS and IEB textbooks and past papers
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Input 
              placeholder="Search textbooks, ISBNs, questions..." 
              className="h-12 pl-12"
            />
            <span className="absolute left-4 top-3.5 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Browse Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Browse by subject</h2>
        {subjects && resources && (
          <SubjectResources 
            subjects={subjects} 
            resourcesBySubject={resourcesBySubject || {}} 
          />
        )}
      </div>
    </div>
  )
}