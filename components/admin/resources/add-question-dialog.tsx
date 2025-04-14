"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ContentEditor } from '@/components/admin/solutions/content-editor'
import { Question, QuestionStatus, SolutionType } from "@prisma/client"
import { addQuestion, updateQuestion } from "@/actions/questions"
import { useToast } from "@/hooks/use-toast"

interface AddQuestionDialogProps {
  resourceId: string
  contentId: string
  questionToEdit?: Question | null
  open: boolean
  onOpenChange: (open: boolean) => void
  totalQuestions: number // For default ordering
}

const questionFormSchema = z.object({
  questionNumber: z.string().min(1, "Question number is required"),
  type: z.nativeEnum(SolutionType),
  status: z.nativeEnum(QuestionStatus).default('DRAFT'),
  exerciseNumber: z.number().nullable().optional(),
  order: z.number().default(0),
  content: z.object({
    mainQuestion: z.string().min(1, "Question content is required"),
    blocks: z.array(z.object({
      type: z.enum(['text', 'image']),
      content: z.string(),
      imageData: z.object({
        url: z.string(),
        caption: z.string().optional(),
        position: z.enum(['above', 'below', 'inline'])
      }).optional()
    })).default([]),
    marks: z.number().nullable().optional(),
  })
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

export function AddQuestionDialog({
  resourceId,
  contentId,
  questionToEdit,
  open,
  onOpenChange,
  totalQuestions,
}: Readonly<AddQuestionDialogProps>) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      questionNumber: "",
      type: "STRUCTURED",
      status: "DRAFT",
      exerciseNumber: null,
      order: totalQuestions + 1,
      content: {
        mainQuestion: "",
        blocks: [],
        marks: null
      }
    },
  });

  useEffect(() => {
    if (questionToEdit) {
      form.reset({
        questionNumber: questionToEdit.questionNumber,
        exerciseNumber: questionToEdit.exerciseNumber,
        type: questionToEdit.type,
        status: questionToEdit.status,
        order: questionToEdit.order || totalQuestions + 1,
        content: questionToEdit.questionContent as any
      });
    } else if (open) {
      form.reset({
        questionNumber: "",
        type: "STRUCTURED",
        status: "DRAFT",
        exerciseNumber: null,
        order: totalQuestions + 1,
        content: {
          mainQuestion: "",
          blocks: [],
          marks: null
        }
      });
    }
  }, [questionToEdit, form, open, totalQuestions]);

  async function onSubmit(data: QuestionFormValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const questionData = {
        questionNumber: data.questionNumber,
        type: data.type,
        status: data.status,
        exerciseNumber: data.exerciseNumber,
        order: data.order,
        content: data.content
      };

      let result;
      if (questionToEdit) {
        result = await updateQuestion(questionToEdit.id, questionData);
      } else {
        result = await addQuestion(resourceId, contentId, questionData);
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: questionToEdit ? "Question updated successfully" : "Question added successfully",
      });

      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: questionToEdit ? "Failed to update question" : "Failed to add question",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {questionToEdit ? "Edit Question" : "Add Question"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-3/4">
                <FormField
                  control={form.control}
                  name="exerciseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Number (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          placeholder="1"
                          onChange={(e) => {
                            const value = e.target.value
                              ? parseInt(e.target.value)
                              : null;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="questionNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 1.1, 4a" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HEADER">Header</SelectItem>
                        <SelectItem value="MCQ">Multiple Choice</SelectItem>
                        <SelectItem value="STRUCTURED">Structured</SelectItem>
                        <SelectItem value="ESSAY">Essay</SelectItem>
                        <SelectItem value="PROOF">Proof</SelectItem>
                        <SelectItem value="DRAWING">Drawing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="LIVE">Live</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="content.mainQuestion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-md">
                    Question Content
                  </FormLabel>
                  <FormControl>
                    <ContentEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content.marks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marks</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseInt(e.target.value)
                          : null;
                        field.onChange(value);
                      }}
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
                {isSubmitting && <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                {questionToEdit ? "Update Question" : "Add Question"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}