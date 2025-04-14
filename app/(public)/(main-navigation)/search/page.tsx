// app/(public)/(main-navigation)/search/page.tsx
import { Suspense } from 'react'
import { searchResources } from '@/actions/search'
import { SearchBox } from '@/components/search-box'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { Resource, Question } from '@prisma/client'


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

        {searchResult.questions.map((question) => (
          <Link
            key={question.id}
            href={`/exercises/${question.contentId}/${question.id}`}
            className="block p-4 border rounded-lg hover:bg-muted/50"
          >
            <p className="font-medium mb-2">{question.content.mainQuestion}</p>
            <p className="text-sm text-muted-foreground">
              {question.resource.title} • {question.content?.title || 'Question'} {question.questionNumber}
            </p>
          </Link>
        ))}

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
                  {question.resource.title}
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

// Matching the naming convention from your subject page
interface PageProps {
  searchParams: Promise<{
    q?: string;
    type?: 'ALL' | 'QUESTIONS' | 'TEXTBOOKS' | 'PAST_PAPERS';
    page?: string;
  }>;
}

// Use the named interface approach like in your subject page
export default async function SearchPage({
  searchParams,
}: Readonly<PageProps>) {
  // Apply the same fix that worked for the subject page
  const resolvedSearchParams = await searchParams;

  // Extract values from the resolved search params
  const query = resolvedSearchParams.q ?? '';
  const type = resolvedSearchParams.type ?? 'ALL';
  const page = parseInt(resolvedSearchParams.page ?? '1');

  return (
    <div className="py-12">
      <div className="max-w-2xl mx-auto mb-8">
        <SearchBox />
      </div>

      {query && (
        <Tabs defaultValue={type} className="space-y-8">
          <TabsList className="w-full flex-wrap justify-start sm:justify-center gap-2 h-auto p-2">
            <TabsTrigger
              value="ALL"
              className="px-4 py-2 rounded-md transition-colors duration-200 
             bg-muted text-muted-foreground 
             data-[state=active]:bg-primary data-[state=active]:text-white 
             hover:bg-accent hover:text-accent-foreground"
            >
              All results
            </TabsTrigger>
            <TabsTrigger
              value="QUESTIONS"
              className="px-4 py-2 rounded-md transition-colors duration-200 
             bg-muted text-muted-foreground 
             data-[state=active]:bg-primary data-[state=active]:text-white 
             hover:bg-accent hover:text-accent-foreground"
            >
              Questions
            </TabsTrigger>
            <TabsTrigger
              value="TEXTBOOKS"
              className="px-4 py-2 rounded-md transition-colors duration-200 
             bg-muted text-muted-foreground 
             data-[state=active]:bg-primary data-[state=active]:text-white 
             hover:bg-accent hover:text-accent-foreground"
            >
              Textbooks
            </TabsTrigger>
            <TabsTrigger
              value="PAST_PAPERS"
              className="px-4 py-2 rounded-md transition-colors duration-200 
             bg-muted text-muted-foreground 
             data-[state=active]:bg-primary data-[state=active]:text-white 
             hover:bg-accent hover:text-accent-foreground"
            >
              Past Papers
            </TabsTrigger>

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