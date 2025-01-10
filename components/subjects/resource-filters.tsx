// components/subjects/resource-filters.tsx
'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ResourceType, CurriculumType } from "@prisma/client"

interface ResourceFiltersProps {
  type?: string | null
  grade?: string | null
  curriculum?: string | null
  grades: number[]
  totalResults: number
  currentPage: number
}

export function ResourceFilters({ 
  type, 
  grade, 
  curriculum, 
  grades,
  totalResults,
  currentPage
}: ResourceFiltersProps) {
  const handleFilterChange = (key: string, value: string | null) => {
    const searchParams = new URLSearchParams(window.location.search)
    if (value) {
      searchParams.set(key, value)
    } else {
      searchParams.delete(key)
    }
    searchParams.set('page', '1')
    window.location.search = searchParams.toString()
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-4">
        <Select 
          value={type || "all"} 
          onValueChange={(value) => handleFilterChange('type', value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Resource Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            <SelectItem value="TEXTBOOK">Textbooks</SelectItem>
            <SelectItem value="PAST_PAPER">Past Papers</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={grade || "all"} 
          onValueChange={(value) => handleFilterChange('grade', value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {grades.map((g) => (
              <SelectItem key={g} value={String(g)}>
                Grade {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={curriculum || "all"} 
          onValueChange={(value) => handleFilterChange('curriculum', value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Curriculum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Curricula</SelectItem>
            <SelectItem value="CAPS">CAPS</SelectItem>
            <SelectItem value="IEB">IEB</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {totalResults > 0 
          ? `${((currentPage - 1) * 15) + 1} - ${Math.min(currentPage * 15, totalResults)} of ${totalResults} results` 
          : 'No results'
        }
      </div>
    </div>
  )
}