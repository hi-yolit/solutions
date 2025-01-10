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
import { addTopic, updateTopic } from "@/actions/topics"
import { useToast } from "@/hooks/use-toast"
import { Topic } from "@prisma/client"
import { topicFormSchema, TopicFormValues } from "@/lib/validations/topic"

interface AddTopicDialogProps {
  resourceId: string
  chapterId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  topic?: Topic
}

export function AddTopicDialog({
  resourceId,
  chapterId,
  open,
  onOpenChange,
  topic
}: AddTopicDialogProps) {
  const { toast } = useToast()
  const isEdit = !!topic
  
  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicFormSchema),
    defaultValues: {
      number: "",
      title: "",
    },
  })

  async function onSubmit(data: TopicFormValues) {
    try {
      let result;
      console.log(data)

      if (isEdit && topic) {
        result = await updateTopic(topic.id, data)
      } else {
        result = await addTopic(chapterId, data)
      }

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
        description: isEdit ? "Topic updated successfully" : "Topic added successfully"
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