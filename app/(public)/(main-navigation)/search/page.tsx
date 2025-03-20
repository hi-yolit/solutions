// app/(public)/(main-navigation)/search/page.tsx
import { Suspense } from 'react'
import { searchResources } from '@/actions/search'
import { SearchBox } from '@/components/search-box'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { Resource, Question, Chapter } from '@prisma/client'

interface SearchResults {
  resources: Array<Resource & { 
    _count: { 
      questions: number 
    } 
  }>
  questions: Array<Question & { 
    resource: Resource
    chapter: Chapter 
    solutions: Array<{ id: string }>
    content: {
      mainQuestion: string
    }
  }>
  totalResources: number
  totalPages: number
  currentPage: number
}

async function SearchResults({ 
  query, 
  type, 
  page 
}: Readonly<{ 
  query: string;
  type: 'ALL' | 'QUESTIONS' | 'TEXTBOOKS' | 'PAST_PAPERS';
  page: number;
}>) {
  const searchResult = query ? await searchResources({ query, type, page }) : null

  if (!searchResult) return null
  
  if ('error' in searchResult) {
    return (
      <div className="text-center py-8 text-red-500">
        {searchResult.error}
      </div>
    )
  }

  return (
    <>
      <TabsContent value="ALL" className="space-y-8">
        {searchResult.resources.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Resources</h2>
            <div className="grid gap-4">
              {searchResult.resources.map((resource) => (
                <Link 
                  key={resource.id}
                  href={`/resources/${resource.id}`}
                  className="p-4 border rounded-lg hover:bg-muted/50"
                >
                  <h3 className="font-medium">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {resource.subject} • {resource.type === 'TEXTBOOK' ? 'Textbook' : 'Past Paper'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {searchResult.questions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Questions</h2>
            <div className="space-y-4">
              {searchResult.questions.map((question) => (
                <Link
                  key={question.id}
                  href={`/questions/${question.id}`}
                  className="block p-4 border rounded-lg hover:bg-muted/50"
                >
                  <p className="font-medium mb-2">{question.content.mainQuestion}</p>
                  <p className="text-sm text-muted-foreground">
                    {question.resource.title} • Chapter {question.chapter.number}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {searchResult.resources.length === 0 && searchResult.questions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No results found
          </div>
        )}
      </TabsContent>

      <TabsContent value="QUESTIONS">
        {searchResult.questions.length > 0 ? (
          <div className="space-y-4">
            {searchResult.questions.map((question) => (
              <Link
                key={question.id}
                href={`/questions/${question.id}`}
                className="block p-4 border rounded-lg hover:bg-muted/50"
              >
                <p className="font-medium mb-2">{question.content.mainQuestion}</p>
                <p className="text-sm text-muted-foreground">
                  {question.resource.title} • Chapter {question.chapter.number}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No questions found
          </div>
        )}
      </TabsContent>

      <TabsContent value="TEXTBOOKS">
        {searchResult.resources.filter(r => r.type === 'TEXTBOOK').length > 0 ? (
          <div className="grid gap-4">
            {searchResult.resources
              .filter(r => r.type === 'TEXTBOOK')
              .map((resource) => (
                <Link
                  key={resource.id}
                  href={`/resources/${resource.id}`}
                  className="p-4 border rounded-lg hover:bg-muted/50"
                >
                  <h3 className="font-medium">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {resource.subject} • Textbook
                  </p>
                </Link>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No textbooks found
          </div>
        )}
      </TabsContent>

      <TabsContent value="PAST_PAPERS">
        {searchResult.resources.filter(r => r.type === 'PAST_PAPER').length > 0 ? (
          <div className="grid gap-4">
            {searchResult.resources
              .filter(r => r.type === 'PAST_PAPER')
              .map((resource) => (
                <Link
                  key={resource.id}
                  href={`/resources/${resource.id}`}
                  className="p-4 border rounded-lg hover:bg-muted/50"
                >
                  <h3 className="font-medium">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {resource.subject} • Past Paper
                  </p>
                </Link>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No past papers found
          </div>
        )}
      </TabsContent>
    </>
  )
}

// Use Next.js's recommended type approach for App Router pages
export default function SearchPage({
  searchParams,
}: Readonly<{
  searchParams: {
    q?: string;
    type?: 'ALL' | 'QUESTIONS' | 'TEXTBOOKS' | 'PAST_PAPERS';
    page?: string;
  };
}>) {
  const query = searchParams.q ?? '';
  const type = searchParams.type ?? 'ALL';
  const page = parseInt(searchParams.page ?? '1');

  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto mb-8">
        <SearchBox />
      </div>

      {query && (
        <Tabs defaultValue={type} className="space-y-8">
          <TabsList className="w-full flex-wrap justify-start sm:justify-center gap-2 h-auto p-2">
            <TabsTrigger value="ALL" className="data-[state=active]:bg-primary">All results</TabsTrigger>
            <TabsTrigger value="QUESTIONS">Questions</TabsTrigger>
            <TabsTrigger value="TEXTBOOKS">Textbooks</TabsTrigger>
            <TabsTrigger value="PAST_PAPERS">Past Papers</TabsTrigger>
          </TabsList>

          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="text-muted-foreground">Loading results...</p>
              </div>
            }
          >
            <SearchResults query={query} type={type} page={page} />
          </Suspense>
        </Tabs>
      )}
    </div>
  )
}