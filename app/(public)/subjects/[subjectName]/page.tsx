// app/subjects/[subjectName]/page.tsx
import { getResources } from '@/actions/resources'
import { ResourceType, CurriculumType } from "@prisma/client"
import { ResourceList } from '@/components/subjects/resource-list'
import { ResourceFilters } from '@/components/subjects/resource-filters'
import { Pagination } from '@/components/pagination'
import Link from 'next/link'

interface PageProps {
  params: {
    subjectName: string
  }
  searchParams: {
    page?: string
    grade?: string
    curriculum?: string
    type?: string
  }
}

export default async function SubjectPage({ params, searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1
  const grade = searchParams.grade
  const curriculum = searchParams.curriculum
  const type = searchParams.type

  const { resources, total, pages } = await getResources({
    status: 'LIVE',
    subject: decodeURIComponent(params.subjectName),
    grade: grade ? Number(grade) : undefined,
    curriculum: curriculum as CurriculumType,
    type: type as ResourceType,
    page: page,
    limit: 15
  }) || { resources: [], total: 0, pages: 0 }

  // Available grades for this subject
  const grades = [8, 9, 10, 11, 12]

  function capitalizeSubject(subject: string): string {
    return subject
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  return (
    <div className="max-w-7xl mx-auto bg-red-400">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
        {capitalizeSubject(decodeURIComponent(params.subjectName))}
        </h1>
      </div>

      <div className="">
        <ResourceFilters 
          type={type}
          grade={grade}
          curriculum={curriculum}
          grades={grades}
          totalResults={total}
          currentPage={page}
        />

        <ResourceList 
          resources={resources}
          currentPage={page}
        />

        {pages > 1 && (
          <Pagination 
            currentPage={page}
            totalPages={pages}
            baseUrl={`/subjects/${params.subjectName}`}
            searchParams={searchParams}
          />
        )}
      </div>
    </div>
  )
}