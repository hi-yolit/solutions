// types/user.ts

export interface DatabaseError {
    message: string
    code?: string
    details?: string
}

export interface Profile {
    id: string
    role: 'ADMIN' | 'STUDENT'
    grade: number | null
    school: string | null
    subjects: string[]
    createdAt: Date
}

export interface ProfileWithMetadata extends Profile {
    user_metadata?: {
        full_name?: string
        avatar_url?: string
    }
    email?: string
}

export type UserRole = 'ADMIN' | 'STUDENT'