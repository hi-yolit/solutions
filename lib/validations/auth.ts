// lib/validations/auth.ts
import * as z from "zod"

export const loginSchema = z.object({
    email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    password: z.string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters')
})

export const signupSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(72, "Password cannot be longer than 72 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type SignupFormValues = z.infer<typeof signupSchema>