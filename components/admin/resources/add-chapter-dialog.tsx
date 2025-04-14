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
import { addContent, updateContent } from "@/actions/contents";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { ContentType, ResourceType } from "@prisma/client";
import { Loader2 } from "lucide-react";

// Define Content type that matches your Prisma schema
interface Content {
  id: string
  type: ContentType
  title: string
  number?: string | null
  resourceId: string
  parentId?: string | null
  order: number
}

// Create a chapter form schema
const chapterFormSchema = z.object({
  number: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  order: z.number().int().optional(),
});

type ChapterFormValues = z.infer<typeof chapterFormSchema>;

interface AddChapterDialogProps {
  resourceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: ResourceType;
  chapter?: Content;
  totalChapters: number;
}

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
  const isPastPaper = resourceType === 'PAST_PAPER';
  const isEdit = !!chapter;

  // Get dialog title based on resource type and edit status
  const getDialogTitle = () => {
    if (isEdit) {
      return isPastPaper ? "Edit Question" : "Edit Chapter";
    }
    return isPastPaper ? "Add Question" : "Add Chapter";
  }

  // Get button text based on resource type and edit status
  const getButtonText = () => {
    if (isEdit) {
      return isPastPaper ? "Update Question" : "Update Chapter";
    }
    return isPastPaper ? "Add Question" : "Add Chapter";
  }

  const form = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterFormSchema),
    defaultValues: {
      number: "",
      title: "",
      order: totalChapters + 1,
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        number: "",
        title: "",
        order: totalChapters + 1,
      });
    } else if (chapter) {
      form.reset({
        number: chapter.number || "",
        title: chapter.title,
        order: chapter.order,
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

      // Determine content type based on resource type
      const contentType = ContentType.CHAPTER;

      // Create content data
      const contentData = {
        ...data,
        type: contentType,
        parentId: null // Top-level content
      };

      if (isEdit && chapter) {
        result = await updateContent(chapter.id, contentData);
      } else {
        result = await addContent(resourceId, contentData);
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
        description: isPastPaper
          ? `Question ${isEdit ? 'updated' : 'added'} successfully`
          : `Chapter ${isEdit ? 'updated' : 'added'} successfully`,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error(error);
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
          <DialogTitle>{getDialogTitle()}</DialogTitle>
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
                      placeholder={isPastPaper ? "e.g., 1, 2, A" : "e.g., 1, 2, 3"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isPastPaper ? "Title (Optional)" : "Title"}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
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

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {getButtonText()}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}