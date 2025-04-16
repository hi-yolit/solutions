// app/(public)/search/page.tsx
import { Suspense } from 'react'
import { searchResources } from '@/actions/search'
import { SearchBox } from '@/components/search-box'
import { Loader2, Book, FileText, BookA, FileQuestion, HelpCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Get icon based on resource type
const getResourceIcon = (resourceType: string) => {
  switch (resourceType) {
    case 'TEXTBOOK':
      return <Book className="h-4 w-4 flex-shrink-0" />;
    case 'PAST_PAPER':
      return <FileText className="h-4 w-4 flex-shrink-0" />;
    case 'STUDY_GUIDE':
      return <BookA className="h-4 w-4 flex-shrink-0" />;
    default:
      return <Book className="h-4 w-4 flex-shrink-0" />;
  }
};

// Get resource type label
const getResourceTypeLabel = (resourceType: string) => {
  switch (resourceType) {
    case 'TEXTBOOK': return 'Textbook';
    case 'PAST_PAPER': return 'Past Paper';
    case 'STUDY_GUIDE': return 'Study Guide';
    default: return resourceType;
  }
};

async function SearchResults({
  query,
  page = 1
}: Readonly<{
  query: string;
  page?: number;
}>) {
  const searchResult = query ? await searchResources({ query, page }) : null

  if (!searchResult) return null

  if ('error' in searchResult) {
    return (
      <div className="text-center py-8 text-red-500">
        {searchResult.error}
      </div>
    )
  }

  // Ensure we have arrays
  const questions = searchResult.questions || [];
  const totalPages = searchResult.totalPages || 1;
  const currentPage = searchResult.currentPage || 1;

  return (
    <div className="space-y-4">
      {/* Search info */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">
          Results for &quot;{query}&quot;
        </h2>
        <div className="text-sm text-muted-foreground">
          Found {searchResult.totalQuestions || 0} question{searchResult.totalQuestions !== 1 ? 's' : ''}
        </div>
      </div>
      
      {/* Questions */}
      {questions.length > 0 ? (
        <div className="border rounded-lg overflow-hidden divide-y">
          {questions.map((question: any) => {
            // For displaying subject information
            const resourceTitle = question.resourceTitle || 'Unknown Resource';
            const resourceType = question.resourceType || 'TEXTBOOK';
            const subject = question.subject || '';
            const grade = question.grade ? `Grade ${question.grade}` : '';
            const year = question.year ? `${question.year}` : '';
            
            // Determine the appropriate link for the question
            const questionLink = question.contentId 
              ? `/exercises/${question.contentId}/${question.id}`
              : `/questions/${question.id}`;
            
            return (
              <Link
                key={question.id}
                href={questionLink}
                className="block hover:bg-muted/20 transition-colors"
              >
                <div className="p-3 sm:p-4">
                  {/* Resource info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    {getResourceIcon(resourceType)}
                    <span className="font-medium">{resourceTitle}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-muted rounded-full">
                      {getResourceTypeLabel(resourceType)}
                    </span>
                  </div>
                  
                  {/* Question location */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <div className="font-medium">
                      {question.type === 'PAGE' ? 'Page' : 'Question'} {question.questionNumber}
                      {question.pageNumber && `, Page ${question.pageNumber}`}
                    </div>
                    
                    <div className="text-sm text-muted-foreground flex gap-2 items-center flex-wrap">
                      {subject && <span>{subject}</span>}
                      {grade && <span>•</span>}
                      {grade && <span>{grade}</span>}
                      {year && <span>•</span>}
                      {year && <span>{year}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 bg-muted/20 rounded-lg">
          <HelpCircle className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-1">No questions found</h3>
          <p className="text-sm text-muted-foreground">Try searching with different terms</p>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link 
                key={pageNum}
                href={`/explore?q=${encodeURIComponent(query)}&page=${pageNum}`}
                passHref
              >
                <Button 
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "min-w-[2.5rem]",
                    pageNum === currentPage ? "pointer-events-none" : ""
                  )}
                >
                  {pageNum}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Matching the naming convention from your subject page
interface PageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

// Use the named interface approach like in your subject page
export default async function PublicSearchPage({
  searchParams,
}: Readonly<PageProps>) {
  // Apply the same fix that worked for the subject page
  const resolvedSearchParams = await searchParams;

  // Extract values from the resolved search params
  const query = resolvedSearchParams.q ?? '';
  const page = parseInt(resolvedSearchParams.page ?? '1');

  return (
    <div className="py-6">
      <div className="max-w-2xl mx-auto mb-6">
        <SearchBox />
      </div>

      {query && (
        <div className="max-w-2xl mx-auto px-4">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center p-10 min-h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin mb-3" />
                <p className="text-muted-foreground">Searching...</p>
              </div>
            }
          >
            <SearchResults query={query} page={page} />
          </Suspense>
        </div>
      )}
    </div>
  )
}