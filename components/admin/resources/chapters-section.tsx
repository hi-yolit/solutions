'use client'

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddChapterDialog } from "./add-chapter-dialog"
import { ChaptersTable } from "./chapters-table"
import type { Chapter } from "@prisma/client"

interface ChaptersSectionProps {
  chapters: Chapter[]
  resourceId: string
}

export function ChaptersSection({ chapters, resourceId }: ChaptersSectionProps) {
  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Chapters</h3>
        <Button onClick={() => setIsAddChapterOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Chapter
        </Button>
      </div>

      <ChaptersTable 
        chapters={chapters}
        resourceId={resourceId}
      />

      <AddChapterDialog
        resourceId={resourceId}
        open={isAddChapterOpen}
        onOpenChange={setIsAddChapterOpen}
      />
    </div>
  )
}