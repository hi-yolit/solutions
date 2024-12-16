'use client'

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TopicsTable } from "./topics-table"
import { AddTopicDialog } from "./add-topic-dialog"
import type { Topic } from "@prisma/client"

interface TopicsSectionProps {
  topics: Topic[]
  resourceId: string
  chapterId: string
}

export function TopicsSection({ topics, resourceId, chapterId }: TopicsSectionProps) {
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Topics</h3>
        <Button onClick={() => setIsAddTopicOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Topic
        </Button>
      </div>

      <TopicsTable 
        topics={topics}
        resourceId={resourceId}
        chapterId={chapterId}
      />

      <AddTopicDialog
        resourceId={resourceId}
        chapterId={chapterId}
        open={isAddTopicOpen}
        onOpenChange={setIsAddTopicOpen}
      />
    </div>
  )
}