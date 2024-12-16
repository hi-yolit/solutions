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
import { addTopic } from "@/actions/topics"
import { useToast } from "@/hooks/use-toast"

const topicFormSchema = z.object({
  number: z.string().min(1, "Topic number is required"),
  title: z.string().optional(),
})

type TopicFormValues = z.infer<typeof topicFormSchema>

interface AddTopicDialogProps {
  resourceId: string
  chapterId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddTopicDialog({
  resourceId,
  chapterId,
  open,
  onOpenChange,
}: AddTopicDialogProps) {
  const { toast } = useToast()
  
  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: {
      number: "",
      title: "",
    },
  })

  async function onSubmit(data: TopicFormValues) {
    try {
      const result = await addTopic(chapterId, data)
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Topic added successfully",
      })
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Topic</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1.1" {...field} />
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
                  <FormLabel>Title (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
              <Button type="submit">
                Add Topic
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}