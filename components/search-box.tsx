// components/search-box.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Loader2, Search, FileQuestion, X, Calculator } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { searchResources } from '@/actions/search'
import type { Question, ContentType } from '@prisma/client'
import Latex from 'react-latex-next'
import 'katex/dist/katex.min.css'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { MathInput } from '@/components/admin/solutions/math-input' // Make sure this path is correct

// Define the JSON structure for questionContent based on your schema
interface QuestionContent {
  mainQuestion: string
  // Add other fields that might be in your questionContent JSON
}

// Define our updated SearchResults interface
interface SearchResults {
  questions: Array<{
    id: string
    resourceId: string
    contentId: string | null
    questionNumber: string
    exerciseNumber: number | null
    type: string
    questionContent: any
    resourceTitle: string
    resourceType: string
    subject: string | null
    grade: number | null
    year: number | null
    term: number | null
    solutions?: Array<{ id: string }>
  }>
  totalQuestions: number
  totalPages: number
  currentPage: number
}

interface SearchError {
  error: string
  details?: string
}

const initialSearchState: SearchResults = {
  questions: [],
  totalQuestions: 0,
  totalPages: 0,
  currentPage: 0
}

export function SearchBox() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResults>(initialSearchState)
  const [mathPopoverOpen, setMathPopoverOpen] = useState(false)
  const [showLatexPreview, setShowLatexPreview] = useState(false)
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

      // Cast the response to our expected structure
      setResults({
        questions: response.questions ?? [],
        totalQuestions: response.totalQuestions ?? 0,
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

    // Check if the query contains LaTeX-like patterns
    const hasLatexSyntax = /[\^_\\{}]/.test(newQuery) || /\$.*\$/.test(newQuery);
    setShowLatexPreview(hasLatexSyntax);

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
    setShowLatexPreview(false)
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

  // Helper function to prepare LaTeX text for rendering
  const prepareLatexText = (text: string): string => {
    if (!text) return '';
    
    // Ensure LaTeX commands are properly escaped
    return text.replace(/\\([a-zA-Z]+)(\{[^}]*\})/g, '\\$1$2');
  };

  // Handle LaTeX insertion from the math input
  const handleLatexInsert = useCallback((latex: string) => {
    // If the latex doesn't include $ signs, add them
    const formattedLatex = latex.includes('$') ? latex : `$${latex}$`;
    
    setQuery(prev => {
      return prev + formattedLatex;
    });
    
    setMathPopoverOpen(false);
    setShowLatexPreview(true);
    
    // Focus back on the input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  }, []);

  // Helper function to safely get the main question from questionContent JSON
  const getMainQuestion = (question: any): string => {
    try {
      if (!question.questionContent) return 'Untitled Question';
      
      // Try to parse if it's a string
      if (typeof question.questionContent === 'string') {
        try {
          const parsed = JSON.parse(question.questionContent);
          return parsed.mainQuestion || 'Untitled Question';
        } catch (e) {
          return 'Untitled Question';
        }
      }
      
      // Otherwise assume it's already an object
      return question.questionContent.mainQuestion || 'Untitled Question';
    } catch (e) {
      console.error('Error parsing question content:', e);
      return 'Untitled Question';
    }
  }

  // Convert query to LaTeX for preview
  const getRenderedQuery = (): string => {
    if (!query) return '';
    
    // Detect LaTeX patterns not already wrapped in $
    const hasUnwrappedLatex = /([^$]|^)([\^_\\{}])/.test(query);
    
    // If query has unwrapped LaTeX syntax, wrap those parts in $
    if (hasUnwrappedLatex) {
      // This is a simplified approach - in a real app you'd want more sophisticated detection
      let processedQuery = query;
      // Match expressions that look like LaTeX but aren't already in $ delimiters
      processedQuery = processedQuery.replace(/([^$]|^)([a-zA-Z0-9]+[\^_\\][a-zA-Z0-9\\{}^_]+)([^$]|$)/g, '$1$$$2$$$3');
      return processedQuery;
    }
    
    return query;
  };

  // Get correct question link based on contentId
  const getQuestionLink = (question: any): string => {
    if (question.contentId) {
      return `/exercises/${question.contentId}/${question.id}`;
    }
    return `/questions/${question.id}`;
  };

  // Quick LaTeX buttons
  const latexButtons = [
    { label: 'x²', command: 'x^{2}' },
    { label: '√', command: '\\sqrt{x}' },
    { label: 'π', command: '\\pi' },
    { label: '±', command: '\\pm' },
    { label: '∫', command: '\\int' },
    { label: '∑', command: '\\sum' }
  ];

  return (
    <div ref={searchContainerRef} className="relative w-full">
      <form onSubmit={handleSearch} className="relative">
        <Input
          ref={inputRef}
          placeholder="Search for questions, exercises"
          value={query}
          onChange={handleInputChange}
          onFocus={() => !isSearchPage && setOpen(true)}
          className="text-xs h-12 pl-12 pr-24"
        />
        
        <button
          type="submit"
          className="absolute left-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Search className="h-5 w-5" />
        </button>
        
        <div className="absolute right-4 top-3.5 flex items-center gap-2">
          <Popover open={mathPopoverOpen} onOpenChange={setMathPopoverOpen}>
            <PopoverTrigger asChild>
              <button 
                type="button"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Insert math equation"
              >
                <Calculator className="h-5 w-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-4" align="end">
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Insert Math Equation</h3>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {latexButtons.map((btn) => (
                    <Button 
                      key={btn.label}
                      variant="outline" 
                      size="sm"
                      onClick={() => handleLatexInsert(btn.command)}
                    >
                      {btn.label}
                    </Button>
                  ))}
                </div>
                
                <MathInput onInsert={handleLatexInsert} />
                
                {query && (
                  <div className="mt-3 p-2 bg-slate-50 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Current search:</p>
                    <div className="latex-preview">
                      <Latex>{prepareLatexText(getRenderedQuery())}</Latex>
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>
      
      {/* LaTeX preview below search box when needed */}
      {showLatexPreview && query && !mathPopoverOpen && (
        <div className="w-full mt-2 p-2 bg-slate-50 rounded-md border">
          <p className="text-xs text-muted-foreground mb-1">Preview:</p>
          <div className="latex-preview">
            <Latex>{prepareLatexText(getRenderedQuery())}</Latex>
          </div>
        </div>
      )}
      
      {!isSearchPage && open && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 w-full mt-2 rounded-lg border shadow-lg bg-white z-50 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            </div>
          ) : (
            <Command className="rounded-lg border-none" shouldFilter={false}>
              <CommandList>
                {results.questions.length > 0 && (
                  <CommandGroup heading="Questions">
                    {results.questions.map((question) => (
                      <CommandItem
                        key={question.id}
                        value={question.id}
                        onSelect={() => {
                          router.push(getQuestionLink(question))
                          setOpen(false)
                          if (inputRef.current) {
                            inputRef.current.blur()
                          }
                        }}
                        className="px-4 py-2"
                      >
                        <FileQuestion className="h-4 w-4 mr-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-muted-foreground truncate">
                            {question.resourceTitle || 'Unknown Resource'} 
                            {` • Question ${question.questionNumber || ''}`}
                          </div>
                          <div className="font-medium truncate">
                            <Latex>{prepareLatexText(getMainQuestion(question))}</Latex>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {results.questions.length === 0 && (
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
                      <FileQuestion className="h-4 w-4 mr-2" />
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
}