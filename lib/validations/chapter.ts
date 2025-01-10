import * as z from 'zod'

export const chapterFormSchema = z.object({
  number: z.number().min(1, "Chapter number must be at least 1").optional(),
  title: z.string().optional(),
})

export type ChapterFormValues = z.infer<typeof chapterFormSchema>