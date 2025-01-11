// src/app/page.tsx
import { getResources, getSuggestedSubjects } from '@/actions/resources'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { BookOpen, CheckCircle2, BookCheck } from 'lucide-react'
import { SubjectResources } from '@/components/subject-resources'
import { Resource } from '@prisma/client'
import { SearchBox } from '@/components/search-box'

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
    <section className="w-full px-4 pb-6 sm:py-12 md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900">
          Find textbook solutions you can trust
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
          Access step-by-step solutions for your CAPS and IEB textbooks and past
          papers
        </p>

        {/* Search Bar - Responsive width and padding */}
        <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl mx-auto px- mb-6 sm:mb-8">
          <SearchBox />
        </div>
      </div>

      {/* Browse Section - Responsive typography and spacing */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">
          Browse by subject
        </h2>
        {subjects && resources && (
          <SubjectResources
            subjects={subjects}
            resourcesBySubject={resourcesBySubject || {}}
          />
        )}
      </div>
    </section>
  );
}