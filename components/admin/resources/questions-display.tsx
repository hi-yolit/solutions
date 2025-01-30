// components/admin/resources/questions-display.tsx
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Question, QuestionStatus } from "@prisma/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Latex from 'react-latex-next'
import { updateQuestionStatus } from "@/actions/questions"
import { useToast } from "@/hooks/use-toast"

interface QuestionDisplayProps {
  question: Question & {
    solutions: {
      id: string;
    }[];
  };
  onManageSolutions: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function QuestionDisplay({
  question,
  onManageSolutions,
  onEdit,
  onDelete
}: QuestionDisplayProps) {
  const { toast } = useToast()
  const content = question.content as any;

  const test = question.resource.type;
  const displayType = test == "TEXTBOOK" ? "Exercise" : "Question";


  const handleStatusChange = async (status: QuestionStatus) => {
    const result = await updateQuestionStatus(question.id, status)
    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      })
    } else {
      toast({
        title: "Success",
        description: "Status updated successfully"
      })
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-lg">
            {displayType}{" "}
            {question.exerciseNumber}
          </h3>
          <Badge variant="outline">{question.type}</Badge>
          <Select value={question.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="LIVE">Live</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {content?.marks > 0 && <Badge>{content?.marks} marks</Badge>}
      </div>

      <div className="space-y-4">
        {/* Main Question */}
        <div className="prose max-w-none">
          <Latex>{content.mainQuestion}</Latex>
        </div>

        {/* Images from blocks */}
        {content.blocks?.map(
          (block: any, index: number) =>
            block.type === "image" && (
              <div key={index} className="my-2">
                <img
                  src={block.imageData.url}
                  alt={block.imageData.caption || "Question image"}
                  className="max-w-full"
                />
                {block.imageData.caption && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {block.imageData.caption}
                  </p>
                )}
              </div>
            )
        )}

        {/* Sub Questions */}
        {content.subQuestions?.length > 0 && (
          <div className="pl-6 space-y-4 mt-4 border-l-2">
            {content.subQuestions.map((subQ: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{subQ.part})</span>
                  <div className="flex-1">
                    <Latex>{subQ.text}</Latex>
                  </div>
                  {subQ.marks > 0 && (
                    <Badge variant="outline">{subQ.marks} marks</Badge>
                  )}
                </div>

                {/* Sub Question Images */}
                {subQ.blocks?.map(
                  (block: any, blockIndex: number) =>
                    block.type === "image" && (
                      <div key={blockIndex} className="my-2">
                        <img
                          src={block.imageData.url}
                          alt={block.imageData.caption || "Question image"}
                          className="max-w-full"
                        />
                        {block.imageData.caption && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {block.imageData.caption}
                          </p>
                        )}
                      </div>
                    )
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4">
        <div className="space-x-2">
          <Button onClick={onManageSolutions} size="sm">
            {question.solutions.length > 0 ? "View Solutions" : "Add Solution"}
          </Button>

          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit {displayType}
          </Button>

          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {question.solutions.length} solution(s)
        </div>
      </div>
    </Card>
  );
}