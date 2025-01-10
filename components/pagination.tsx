// components/pagination.tsx
'use client'

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams: Record<string, string | undefined>
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  baseUrl,
  searchParams
}: PaginationProps) {
  const router = useRouter()

  const createQueryString = (newPage: number) => {
    const params = new URLSearchParams(searchParams as Record<string, string>)
    params.set('page', newPage.toString())
    return params.toString()
  }

  const handlePageChange = (newPage: number) => {
    const queryString = createQueryString(newPage)
    router.push(`${baseUrl}?${queryString}`)
  }

  return (
    <div className="flex justify-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        if (i === 0 || i === totalPages - 1 || (i >= currentPage - 2 && i <= currentPage + 2)) {
          return (
            <Button
              key={i + 1}
              variant={i + 1 === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </Button>
          )
        } else if (i === 1 || i === totalPages - 2) {
          return <span key={i} className="px-2">...</span>
        }
        return null
      })}

      <Button 
        variant="outline" 
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  )
}