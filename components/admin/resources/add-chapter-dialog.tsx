"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addChapter, updateChapter } from "@/actions/chapters";
import {
  chapterFormSchema,
  type ChapterFormValues,
} from "@/lib/validations/chapter";
import { useToast } from "@/hooks/use-toast";
import { Chapter, ResourceType } from "@prisma/client";
import { Loader2 } from "lucide-react";

interface AddChapterDialogProps {
  resourceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: ResourceType;
  chapter?: Chapter;
  totalChapters: number;
}

const getSuccessMessage = (isEdit: boolean, isPastPaper: boolean) => {
  if (isEdit) {
    return isPastPaper
      ? "Question updated successfully"
      : "Chapter updated successfully";
  }
  return isPastPaper
    ? "Question added successfully"
    : "Chapter added successfully";
};

const getDialogTitle = (isEdit: boolean, isPastPaper: boolean) => {
  if (isEdit) {
    return isPastPaper ? "Edit Question" : "Edit Chapter";
  }
  return isPastPaper ? "Add Question" : "Add Chapter";
};

const getButtonText = (isEdit: boolean, isPastPaper: boolean) => {
  if (isEdit) {
    return isPastPaper ? "Update Question" : "Update Chapter";
  }
  return isPastPaper ? "Add Question" : "Add Chapter";
};

export function AddChapterDialog({
  resourceId,
  open,
  onOpenChange,
  resourceType,
  chapter,
  totalChapters,
}: Readonly<AddChapterDialogProps>) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPastPaper = resourceType === "PAST_PAPER";
  const isEdit = !!chapter;

  const form = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterFormSchema),
    defaultValues: {
      number: totalChapters,
      title: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        number: totalChapters,
        title: "",
      });
    } else if (chapter) {
      form.reset({
        number: chapter.number ?? 1,
        title: chapter.title ?? "",
      });
    }
    return () => {
      form.reset();
    };
  }, [open, chapter, form, totalChapters]);
  async function onSubmit(data: ChapterFormValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      let result;

      if (isEdit && chapter) {
        result = await updateChapter(chapter.id, data);
        form.reset();
      } else {
        result = await addChapter(resourceId, data);
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        variant: "success",
        description: getSuccessMessage(isEdit, isPastPaper),
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getDialogTitle(isEdit, isPastPaper)}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isPastPaper ? "Question Number" : "Chapter Number"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isPastPaper && (
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                {getButtonText(isEdit, isPastPaper)}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
