'use client'

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FAB } from "@/components/ui/fab"
import { TopicsTable } from "./topics-table"
import { AddTopicDialog } from "./add-topic-dialog"
import type { Topic } from "@prisma/client"

interface TopicsSectionProps {
  topics: Topic[]
  resourceId: string
  chapterId: string
}

export function TopicsSection({ topics, resourceId, chapterId }: TopicsSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTopic, setTopicChapter] = useState<Topic | undefined>()

  const handleEdit = (topic: Topic) => {
    setTopicChapter(topic)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Topics</h3>
      </div>

      <TopicsTable 
        topics={topics}
        resourceId={resourceId}
        chapterId={chapterId}
        onEdit={handleEdit}
      />

      <AddTopicDialog
        resourceId={resourceId}
        chapterId={chapterId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        topic={selectedTopic}
      />

      <FAB 
        onClick={() => setDialogOpen(true)}
        text="Add Topic"
      />
    </div>
  )
}