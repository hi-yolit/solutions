"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect } from "react";
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

interface AddChapterDialogProps {
  resourceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: ResourceType;
  chapter?: Chapter;
}

export function AddChapterDialog({
  resourceId,
  open,
  onOpenChange,
  resourceType,
  chapter,
}: AddChapterDialogProps) {
  const { toast } = useToast();
  const isPastPaper = resourceType === "PAST_PAPER";
  const isEdit = !!chapter;

  const form = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterFormSchema),
    defaultValues: {
      number: 1,
      title: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        number: 1,
        title: "",
      });
    }
  }, [open, form]);

  useEffect(() => {
    if (chapter) {
      form.reset({
        number: chapter.number ?? 1,
        title: chapter.title ?? "",
      });
    }
  }, [chapter, form]);

  async function onSubmit(data: ChapterFormValues) {
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
        description: isEdit
          ? isPastPaper
            ? "Question updated successfully"
            : "Chapter updated successfully"
          : isPastPaper
          ? "Question added successfully"
          : "Chapter added successfully",
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? isPastPaper
                ? "Edit Question"
                : "Edit Chapter"
              : isPastPaper
              ? "Add Question"
              : "Add Chapter"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  {isPastPaper ? "Question Number" : "Chapter Number"}
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
              <Button type="submit">
                {isEdit
                  ? isPastPaper
                    ? "Update Question"
                    : "Update Chapter"
                  : isPastPaper
                  ? "Add Question"
                  : "Add Chapter"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}