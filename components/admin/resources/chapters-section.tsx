'use client'

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddChapterDialog } from "./add-chapter-dialog"
import { ChaptersTable } from "./chapters-table"
import type { Chapter, ResourceType } from "@prisma/client"

interface ChaptersSectionProps {
  chapters: Chapter[]
  resourceId: string
  resourceType: ResourceType
}

export function ChaptersSection({ chapters, resourceId, resourceType }: ChaptersSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | undefined>()

  const handleEdit = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">
          {resourceType === 'PAST_PAPER' ? 'Questions' : 'Chapters'}
        </h3>
        <Button onClick={() => {
          setSelectedChapter(undefined)
          setDialogOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          {resourceType === 'PAST_PAPER' ? 'Add Question' : 'Add Chapter'}
        </Button>
      </div>

      <ChaptersTable 
        chapters={chapters}
        resourceId={resourceId}
        resourceType={resourceType}
        onEdit={handleEdit}
      />

      <AddChapterDialog
        resourceId={resourceId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        resourceType={resourceType}
        chapter={selectedChapter}
      />
    </div>
  )
}