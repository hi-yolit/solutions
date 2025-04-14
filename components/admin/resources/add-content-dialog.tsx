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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addContent, updateContent } from "@/actions/contents";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { ContentType, ResourceType } from "@prisma/client";
import { Loader2 } from "lucide-react";

// Define a Content type that matches your Prisma schema
interface Content {
  id: string
  type: ContentType
  title: string
  number?: string | null
  resourceId: string
  parentId?: string | null
  order: number
  pageNumber?: number | null
  _count?: {
    questions: number;
    children: number;
  };
}

// Create a content form schema with type selection
const contentFormSchema = z.object({
  type: z.enum(['CHAPTER', 'SECTION', 'PAGE', 'EXERCISE']),
  number: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  order: z.number().int().optional(),
  pageNumber: z.coerce.number().optional(),
});

type ContentFormValues = z.infer<typeof contentFormSchema>;

interface AddContentDialogProps {
  resourceId: string;
  parentId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: ResourceType;
  contentTypeOptions: ContentType[];  // Multiple options
  defaultContentType: ContentType;    // Default selected type
  content?: Content;
  totalItems: number;
}

export function AddContentDialog({
  resourceId,
  parentId,
  open,
  onOpenChange,
  resourceType,
  contentTypeOptions,
  defaultContentType,
  content,
  totalItems,
}: Readonly<AddContentDialogProps>) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPastPaper = resourceType === 'PAST_PAPER';
  const isEdit = !!content;

  // Get content type label
  const getContentTypeLabel = (type: ContentType) => {
    if (isPastPaper) {
      switch (type) {
        case 'CHAPTER': return 'Section'
        case 'SECTION': return 'Question'
        case 'PAGE': return 'Sub-question'
        case 'EXERCISE': return 'Exercise'
        default: return 'Item'
      }
    } else {
      switch (type) {
        case 'CHAPTER': return 'Chapter'
        case 'SECTION': return 'Section'
        case 'PAGE': return 'Page'
        case 'EXERCISE': return 'Exercise'
        default: return 'Item'
      }
    }
  }

  // Get dialog title based on edit status
  const getDialogTitle = () => {
    if (isEdit) {
      return `Edit ${getContentTypeLabel(content!.type)}`;
    }

    if (contentTypeOptions.length === 1) {
      return `Add ${getContentTypeLabel(contentTypeOptions[0])}`;
    }

    return "Add Content";
  }

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      type: defaultContentType,
      number: "",
      title: "",
      order: totalItems + 1,
      pageNumber: undefined,
    },
  });

  const selectedType = form.watch('type');
  const showPageNumber = selectedType === 'PAGE';

  useEffect(() => {
    if (!open) {
      form.reset({
        type: defaultContentType,
        number: "",
        title: "",
        order: totalItems + 1,
        pageNumber: undefined,
      });
    } else if (content) {
      form.reset({
        type: content.type,
        number: content.number || "",
        title: content.title,
        order: content.order,
        pageNumber: content.pageNumber || undefined,
      });
    }
    return () => {
      form.reset();
    };
  }, [open, content, form, totalItems, defaultContentType]);

  async function onSubmit(data: ContentFormValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      let result;

      // Create content data
      const contentData = {
        ...data,      
        parentId: isEdit ? content?.parentId : parentId || null

      };

      if (isEdit && content) {
        result = await updateContent(content.id, contentData);
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
        description: `${getContentTypeLabel(data.type)} ${isEdit ? 'updated' : 'added'} successfully`,
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

  // Only show type selector if there are multiple options and we're not editing
  const showTypeSelector = contentTypeOptions.length > 1 && !isEdit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {(showTypeSelector || isEdit) && (
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value as ContentType)}
                      disabled={isEdit}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isEdit
                          ? [content!.type].map(type => (
                            <SelectItem key={type} value={type}>
                              {getContentTypeLabel(type as ContentType)}
                            </SelectItem>
                          ))
                          : contentTypeOptions.map(type => (
                            <SelectItem key={type} value={type}>
                              {getContentTypeLabel(type as ContentType)}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {!showPageNumber && (<FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {getContentTypeLabel(selectedType)} Number (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={`e.g., "1", "1.1", "A"`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />)}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showPageNumber && (
              <FormField
                control={form.control}
                name="pageNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                {isEdit ? `Update ${getContentTypeLabel(selectedType)}` : `Add ${getContentTypeLabel(selectedType)}`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}