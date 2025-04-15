// actions/search.ts
'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

interface SearchParams {
    query: string
    page?: number
    limit?: number
}

// Define the question result type to match our SQL query
interface QuestionResult {
    id: string
    resourceId: string
    contentId: string | null
    questionNumber: string
    exerciseNumber: number | null
    type: string
    status: string
    questionContent: any
    pageNumber: number | null
    createdAt: Date
    updatedAt: Date
    order: number
    // Resource fields joined by our query
    resourceTitle: string
    resourceType: string
    subject: string | null
    grade: number | null
    year: number | null
    term: number | null
    publisher: string | null
    edition: string | null
    curriculum: string | null
    // Solutions count will be added programmatically
    solutions?: Array<{ id: string }>
}

// Count result type
interface CountResult {
    total: string | number
}

// Function to generate all variations of a LaTeX expression
const generateLatexVariations = (query: string): string[] => {
    const variations = new Set<string>([query]);
    
    // Convert between different exponent formats:
    // x^{2} ↔ x^2 ↔ x2
    const withoutBraces = query.replace(/\^\{([^}]+)\}/g, '^$1');
    variations.add(withoutBraces);
    
    const withoutCaret = query.replace(/\^(?:\{([^}]+)\}|(\d))/g, '$1$2');
    variations.add(withoutCaret);
    
    // Add braces if not present
    if (query.includes('^') && !query.includes('^{')) {
        const withBraces = query.replace(/\^(\d+|\w+)(?!\{)/g, '^{$1}');
        variations.add(withBraces);
    }
    
    // Convert between x2 and x^{2} formats
    if (query.match(/[a-zA-Z]\d+/)) {
        const withCaret = query.replace(/([a-zA-Z])(\d+)/g, '$1^$2');
        const withBraces = query.replace(/([a-zA-Z])(\d+)/g, '$1^{$2}');
        variations.add(withCaret);
        variations.add(withBraces);
    }
    
    // Add/remove $ delimiters
    if (!query.includes('$')) {
        variations.add(`$${query}$`);
    } else if (query.startsWith('$') && query.endsWith('$')) {
        variations.add(query.slice(1, -1));
    }
    
    // Add more variations for all existing variations
    const currentVariations = [...variations];
    for (const variant of currentVariations) {
        // Add $ to variants that don't have them
        if (!variant.includes('$') && (
            variant.includes('^') || variant.includes('{') || 
            variant.includes('}') || variant.includes('\\')
        )) {
            variations.add(`$${variant}$`);
        }
    }
    
    // Return all unique variations
    return [...variations];
};

export async function searchResources({
    query,
    page = 1,
    limit = 10
}: SearchParams) {
    try {
        console.log('Search started with query:', query);
        const skip = (page - 1) * limit;

        // Generate query variations for better matching with LaTeX
        const searchQueries = generateLatexVariations(query);
        console.log('Using query variations:', searchQueries);

        // Build a complex LIKE pattern with all variations
        const escapedPatterns = searchQueries.map(q => {
            // For JSON search, we need to escape special characters
            return q.replace(/[\\%_]/g, '\\$&')
                  .replace(/'/g, "''")
                  .toLowerCase();
        });
        
        // Create SQL LIKE conditions for the questionContent JSON field
        const likeConditions = escapedPatterns.map(pattern => 
            `LOWER(q."questionContent"::text) LIKE '%${pattern}%'`
        ).join(' OR ');
        
        // Use a raw query that joins questions with their resources
        const rawQuery = `
            SELECT q.*, r.title as "resourceTitle", r.type as "resourceType", 
                   r.subject, r.grade, r.year, r.term, 
                   r.publisher, r.edition, r.curriculum
            FROM "Question" q
            JOIN "Resource" r ON q."resourceId" = r.id
            LEFT JOIN "Content" c ON q."contentId" = c.id
            WHERE ${likeConditions}
            ORDER BY q."updatedAt" DESC
            LIMIT ${limit} OFFSET ${skip}
        `;
        
        const questions = await prisma.$queryRawUnsafe(rawQuery) as QuestionResult[];
        console.log('Found questions:', questions.length);

        // Get solution counts for each question
        if (questions.length > 0) {
            const questionIds = questions.map((q) => q.id);
            const solutionCounts = await prisma.solution.groupBy({
                by: ['questionId'],
                where: {
                    questionId: {
                        in: questionIds
                    }
                },
                _count: true
            });

            // Create a map of question ID to solution count
            const solutionCountMap = new Map();
            solutionCounts.forEach(sc => {
                solutionCountMap.set(sc.questionId, sc._count);
            });

            // Add the solutions count to each question
            questions.forEach(q => {
                const count = solutionCountMap.get(q.id) || 0;
                q.solutions = Array(count).fill({ id: 'placeholder' });
            });
        }

        // Count total questions for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM "Question" q
            WHERE ${likeConditions}
        `;
        
        const countResult = await prisma.$queryRawUnsafe(countQuery) as CountResult[];
        const totalQuestions = parseInt(String(countResult[0]?.total) || '0');
        const totalPages = Math.ceil(totalQuestions / limit);

        console.log('Search completed successfully - Total questions:', totalQuestions);
        
        return {
            questions: questions || [],
            totalQuestions,
            totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Search error:', error);
        return {
            error: 'Failed to search',
            details: error instanceof Error ? error.message : 'Unknown error',
            questions: [],
            totalQuestions: 0,
            totalPages: 0,
            currentPage: 0,
        };
    }
}