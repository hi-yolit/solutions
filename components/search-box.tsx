/* // components/search-box.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Loader2, Search, Book, FileText, HelpCircle, X } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { searchResources } from '@/actions/search'
import type { Resource, Question, ResourceType } from '@prisma/client'

interface SearchResults {
  resources: Array<Resource & {
    _count: {
      questions: number
    }
  }>
  questions: Array<Question & {
    resource: Resource
    content: Content
    solutions: Array<{ id: string }>
    content: {
      mainQuestion: string
    }
  }>
  totalResources: number
  totalPages: number
  currentPage: number
}

interface SearchError {
  error: string
  details?: string
}

const initialSearchState: SearchResults = {
  resources: [],
  questions: [],
  totalResources: 0,
  totalPages: 0,
  currentPage: 0
}

export function SearchBox() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResults>(initialSearchState)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isSearchPage = pathname === '/search'

  // Initialize query from URL on search page
  useEffect(() => {
    if (isSearchPage) {
      setQuery(searchParams?.get('q') || '')
    }
  }, [isSearchPage, searchParams])

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults(initialSearchState)
      return
    }

    setLoading(true)

    try {
      const response = await searchResources({
        query: searchQuery,
        limit: 5
      })

      if ('error' in response) {
        console.error('Search error:', response.error)
        setResults(initialSearchState)
        return
      }

      setResults({
        resources: response.resources ?? [],
        questions: response.questions ?? [],
        totalResources: response.totalResources ?? 0,
        totalPages: response.totalPages ?? 0,
        currentPage: response.currentPage ?? 0
      })
    } catch (error) {
      console.error('Search error:', error)
      setResults(initialSearchState)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isSearchPage) return // Don't perform search if on search page

    const timeoutId = setTimeout(() => {
      if (query) {
        performSearch(query)
      } else {
        setResults(initialSearchState)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, performSearch, isSearchPage])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (!isSearchPage) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSearchPage])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)

    if (isSearchPage) {
      // Update URL with new query
      const params = new URLSearchParams(window.location.search)
      if (newQuery) {
        params.set('q', newQuery)
      } else {
        params.delete('q')
      }
      params.delete('page') // Reset page when query changes
      router.push(`/search?${params.toString()}`)
    } else {
      setOpen(true)
    }
  }

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!query.trim()) return

    const params = new URLSearchParams()
    params.set('q', query.trim())
    router.push(`/search?${params.toString()}`)

    if (!isSearchPage) {
      setOpen(false)
    }
    if (inputRef.current) {
      inputRef.current.blur() // Hide mobile keyboard
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults(initialSearchState)
    if (isSearchPage) {
      router.push('/search')
    } else {
      setOpen(false)
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div ref={searchContainerRef} className="relative w-full">
      <form onSubmit={handleSearch} className="relative">
        <Input
          ref={inputRef}
          placeholder="Search textbooks, ISBNs, questions..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => !isSearchPage && setOpen(true)}
          className="h-12 pl-12 pr-10"
        />
        <button
          type="submit"
          className="absolute left-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Search className="h-5 w-5" />
        </button>
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </form>
      {!isSearchPage && open && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 w-full mt-2 rounded-lg border shadow-lg bg-white z-50 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            </div>
          ) : (
            <Command className="rounded-lg border-none" shouldFilter={false}>
              <CommandList>
                {results.resources.length > 0 && (
                  <CommandGroup heading="Textbooks">
                    {results.resources.map((resource) => (
                      <CommandItem
                        key={resource.id}
                        value={resource.id}
                        onSelect={() => {
                          router.push(`/resources/${resource.id}`)
                          setOpen(false)
                          if (inputRef.current) {
                            inputRef.current.blur()
                          }
                        }}
                        className="px-4 py-2"
                      >
                        <Book className="h-4 w-4 mr-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{resource.title}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {resource.subject} • {resource.type === 'TEXTBOOK' ? 'Textbook' : 'Past Paper'}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {results.questions.length > 0 && (
                  <CommandGroup heading="Questions">
                    {results.questions.map((question) => (
                      <CommandItem
                        key={question.id}
                        value={question.id}
                        onSelect={() => {
                          router.push(`/questions/${question.id}`)
                          setOpen(false)
                          if (inputRef.current) {
                            inputRef.current.blur()
                          }
                        }}
                        className="px-4 py-2"
                      >
                        <HelpCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {question.content.mainQuestion}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {question.resource.title} • Chapter {question.chapter.number}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {results.resources.length === 0 && results.questions.length === 0 && (
                  <CommandEmpty className="py-6 text-center text-muted-foreground">
                    No results found
                  </CommandEmpty>
                )}

                {query.length >= 2 && (
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        handleSearch()
                        setOpen(false)
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View all results
                    </Button>
                  </div>
                )}
              </CommandList>
            </Command>
          )}
        </div>
      )}
    </div>
  )
} */