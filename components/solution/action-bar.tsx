// src/components/solution/action-bar.tsx
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Bookmark, Share2 } from "lucide-react"

export function ActionBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <ThumbsUp className="h-4 w-4 mr-2" />
            Helpful
          </Button>
          <Button variant="outline" size="sm">
            <ThumbsDown className="h-4 w-4 mr-2" />
            Not Helpful
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  )
}