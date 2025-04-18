import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Question, QuestionStatus, ResourceType } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Latex from "react-latex-next";
import { updateQuestionStatus } from "@/actions/questions";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Pencil, Trash } from "lucide-react";

interface QuestionDisplayProps {
  question: Question & {
    solutions: {
      id: string;
    }[];
    resource?: {
      type: ResourceType;
    };
  };
  onManageSolutions: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

interface QuestionContent {
  marks?: number;
  mainQuestion: string;
  blocks?: Array<{
    type: string;
    imageData?: {
      url: string;
      caption?: string;
    };
  }>;
}

export function QuestionDisplay({
  question,
  onManageSolutions,
  onEdit,
  onDelete,
}: Readonly<QuestionDisplayProps>) {
  const { toast } = useToast();
  const content = question.questionContent as unknown as QuestionContent;

  const displayType =
    question?.resource?.type === "TEXTBOOK" ? "Exercise" : "Question";

  const handleStatusChange = async (status: QuestionStatus) => {
    const result = await updateQuestionStatus(question.id, status);
    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-lg">
            {displayType} {question.exerciseNumber && `${question.exerciseNumber}.`}{question.questionNumber}
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
        {content?.marks != null && content?.marks > 0 && (
          <Badge>{content?.marks} marks</Badge>
        )}
      </div>

      <div className="space-y-4">
        {/* Question Content */}
        <div className="prose max-w-none">
          <Latex>{content.mainQuestion}</Latex>
        </div>

        {/* Images from blocks */}
        {content.blocks?.map(
          (block, index) =>
            block.type === "image" && block.imageData && (
              <div key={index} className="my-2">
                <Image
                  src={block.imageData.url}
                  alt={block.imageData.caption ?? "Question image"}
                  width={500} // Adjust as needed
                  height={300} // Adjust as needed
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
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

      <div className="flex justify-between items-center pt-4">
        <div className="space-x-2">
          <Button onClick={onManageSolutions} size="sm">
            {question.solutions.length > 0 ? "View Solutions" : "Add Solution"}
          </Button>

          <Button
            variant="outline"
            aria-label="Edit"
            size="icon"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            aria-label="Delete"
            onClick={onDelete}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {question.solutions.length} solution(s)
        </div>
      </div>
    </Card>
  );
}