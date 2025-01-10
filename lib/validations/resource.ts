// src/lib/validations/resource.ts
import * as z from "zod"

export const resourceFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["TEXTBOOK", "PAST_PAPER", "STUDY_GUIDE"]),
  subject: z.string().min(1, "Subject is required"),
  grade: z.number().min(8).max(12),
  curriculum: z.enum(["CAPS", "IEB"]),
  year: z.number().min(2000).max(2030),
  term: z.number().min(1).max(4).optional(),
  publisher: z.string().optional(),
  edition: z.string().optional(),
  coverImage: z.string().optional(),
  status: z.enum(["DRAFT", "LIVE"]).default("DRAFT")
})

export type ResourceFormValues = z.infer<typeof resourceFormSchema>