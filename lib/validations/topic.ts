import * as z from 'zod'

export const topicFormSchema = z.object({
    number: z.string().min(1, "Topic number is required"),
    title: z.string().optional(),
})

export type TopicFormValues = z.infer<typeof topicFormSchema>