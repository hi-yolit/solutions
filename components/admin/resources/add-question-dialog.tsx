"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { ImageData } from '@/types/editor'

const questionFormSchema = z.object({
  number: z.string().min(1, "Question number is required"),
  type: z.enum(["MCQ", "STRUCTURED", "ESSAY", "PROOF"]),
  content: z.string(),
  contentBlocks: z.array(z.object({
    type: z.enum(['text', 'image']),
    content: z.string(),
    imageData: z.object({
      url: z.string(),
      caption: z.string().optional(),
      position: z.enum(['above', 'below', 'inline'])
    }).optional()
  })).optional(),
  marks: z.number().optional(),
});

type QuestionFormValues = z.infer<typeof questionFormSchema>

interface AddQuestionDialogProps {
  resourceId: string
  chapterId: string
  topicId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddQuestionDialog({
  resourceId,
  chapterId,
  topicId,
  open,
  onOpenChange,
}: AddQuestionDialogProps) {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      number: "",
      content: "",
      marks: 1,
      contentBlocks: [],
    },
  })

  async function onSubmit(data: QuestionFormValues) {
    try {
      // Here you would make your API call to create the question
      console.log(data)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddImage = (imageData: ImageData) => {
    const currentBlocks = form.getValues('contentBlocks') || [];
    const newBlock = {
      type: 'image' as const,
      content: '',
      imageData
    };
    
    form.setValue('contentBlocks', [...currentBlocks, newBlock]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="marks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marks (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MCQ">Multiple Choice</SelectItem>
                      <SelectItem value="STRUCTURED">Structured</SelectItem>
                      <SelectItem value="ESSAY">Essay</SelectItem>
                      <SelectItem value="PROOF">Proof</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Content</FormLabel>
                  <FormControl>
                    <ContentEditor
                      value={field.value}
                      onChange={field.onChange}
                      onImageAdd={handleAddImage}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display Images */}
            {form.watch('contentBlocks')?.map((block, blockIndex) => {
              if (block.type === 'image' && block.imageData) {
                return (
                  <div key={blockIndex} className="border rounded-lg p-4">
                    <img 
                      src={block.imageData.url} 
                      alt={block.imageData.caption || 'Question image'}
                      className="max-w-full h-auto"
                    />
                    {block.imageData.caption && (
                      <p className="mt-2 text-sm text-gray-600">
                        {block.imageData.caption}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            })}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Add Question
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}