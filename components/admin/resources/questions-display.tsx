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
    imageData: {
      url: string;
      caption?: string;
    };
  }>;
  subQuestions?: Array<SubQuestion>;
}

interface SubQuestion {
  part: string;
  text: string;
  marks: number;
  blocks?: Array<ImageBlock>;
}

interface ImageBlock {
  type: string;
  imageData: {
    url: string;
    caption?: string;
  };
}

export function QuestionDisplay({
  question,
  onManageSolutions,
  onEdit,
  onDelete,
}: Readonly<QuestionDisplayProps>) {
  const { toast } = useToast();
  const content = question.content as unknown as QuestionContent;

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
            {displayType} {question.exerciseNumber}
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
        {/* Main Question */}
        <div className="prose max-w-none">
          <Latex>{content.mainQuestion}</Latex>
        </div>

        {/* Images from blocks */}
        {content.blocks?.map(
          (block: ImageBlock) =>
            block.type === "image" && (
              <div key={block.imageData.url} className="my-2">
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

        {/* Sub Questions */}
        {content.subQuestions?.length && content.subQuestions.length > 0 && (
          <div className="pl-6 space-y-4 mt-4 border-l-2">
            {content.subQuestions.map((subQ: SubQuestion, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{subQ.part})</span>
                  <div className="flex-1">
                    <Latex>{subQ.text}</Latex>
                  </div>
                  {subQ.marks != null && (
                    <Badge variant="outline">{subQ.marks} marks</Badge>
                  )}
                </div>

                {/* Sub Question Images */}
                {subQ.blocks?.map(
                  (block: ImageBlock, blockIndex: number) =>
                    block.type === "image" && (
                      <div key={blockIndex} className="my-2">
                        <Image
                          src={block.imageData.url}
                          alt={block.imageData.caption || "Question image"}
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
