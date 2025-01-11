"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { useEffect } from "react"
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
import { Card } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { Question, QuestionStatus, SolutionType } from "@prisma/client"
import { addQuestion, updateQuestion } from "@/actions/questions"
import { useToast } from "@/hooks/use-toast"
import { Content } from "@radix-ui/react-tabs"

interface AddQuestionDialogProps {
  resourceId: string
  chapterId: string
  topicId?: string
  questionToEdit?: Question | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const questionFormSchema = z.object({
  questionNumber: z.string().min(1, "Question number is required"),
  type: z.nativeEnum(SolutionType),
  status: z.nativeEnum(QuestionStatus).default('DRAFT'),
  pageNumber: z.number().nullable().optional(),
  exerciseNumber: z.number().nullable().optional(),
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
    subQuestions: z.array(z.object({
      part: z.string(),
      text: z.string(),
      type: z.nativeEnum(SolutionType),
      marks: z.number().nullable().default(null),
      blocks: z.array(z.object({
        type: z.enum(['text', 'image']),
        content: z.string(),
        imageData: z.object({
          url: z.string(),
          caption: z.string().optional(),
          position: z.enum(['above', 'below', 'inline'])
        }).optional()
      })).default([])
    })).optional().default([])
  })
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

export function AddQuestionDialog({
  resourceId,
  chapterId,
  topicId,
  questionToEdit,
  open,
  onOpenChange,
}: AddQuestionDialogProps) {
  const { toast } = useToast()

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      questionNumber: "",
      type: "STRUCTURED",
      status: "DRAFT",
      pageNumber: null,
      exerciseNumber: null,
      content: {
        mainQuestion: "",
        blocks: [],
        marks: null,
        subQuestions: []
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
        pageNumber: questionToEdit.pageNumber,
        content: questionToEdit.content as any
      });
    }
  }, [questionToEdit, form]);

  const { fields: subQuestionFields, append: appendSubQuestion, remove: removeSubQuestion } =
    useFieldArray({
      control: form.control,
      name: "content.subQuestions"
    });

  const handleAddSubQuestion = () => {
    appendSubQuestion({
      part: String.fromCharCode(97 + subQuestionFields.length), // a, b, c...
      text: "",
      type: form.getValues('type'),
      marks: null,
      blocks: []
    });
  };

  async function onSubmit(data: QuestionFormValues) {
    try {
      const questionData = {
        questionNumber: data.questionNumber,
        type: data.type,
        status: data.status,
        pageNumber: data.pageNumber,
        exerciseNumber: data.exerciseNumber,
        content: {
          ...data.content,
          marks: data.content?.marks

        }
      };

      let result;
      if (questionToEdit) {
        result = await updateQuestion(questionToEdit.id, questionData);
      } else {
        result = await addQuestion(resourceId, chapterId, topicId, questionData);
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
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{questionToEdit ? 'Edit Question' : 'Add Question'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="questionNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 1.1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pageNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : null;
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
                name="exerciseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exercise Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : null;
                          field.onChange(value);
                        }}
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
                  <FormLabel>Main Question</FormLabel>
                  <FormControl>
                    <ContentEditor
                      value={field.value}
                      onChange={field.onChange}
                      onImageAdd={(imageData) => {
                        const currentBlocks = form.getValues('content.blocks') || [];
                        form.setValue('content.blocks', [...currentBlocks, {
                          type: 'image',
                          content: '',
                          imageData
                        }]);
                      }}
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
                  <FormLabel>Main Question Marks</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : null;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Sub Questions</FormLabel>
              </div>

              {subQuestionFields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`content.subQuestions.${index}.part`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Part</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., a" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`content.subQuestions.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
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
                          name={`content.subQuestions.${index}.marks`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Marks</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  value={field.value ?? ''}
                                  onChange={(e) => {
                                    const value = e.target.value ? parseInt(e.target.value) : null;
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`content.subQuestions.${index}.text`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question</FormLabel>
                            <FormControl>
                              <ContentEditor
                                value={field.value}
                                onChange={field.onChange}
                                onImageAdd={(imageData) => {
                                  const currentBlocks =
                                    form.getValues(`content.subQuestions.${index}.blocks`) || [];
                                  form.setValue(`content.subQuestions.${index}.blocks`,
                                    [...currentBlocks, {
                                      type: 'image',
                                      content: '',
                                      imageData
                                    }]
                                  );
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubQuestion(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              
              <Button type="button" variant="outline" onClick={handleAddSubQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Part
                </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {questionToEdit ? 'Update Question' : 'Add Question'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}