"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Command, X, Student, Users, BookOpen, GraduationCap, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { globalSearch, type SearchResult } from '@/actions/search'
import { useRouter } from 'next/navigation'

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const toggleSearch = useCallback(() => setIsOpen(open => !open), [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggleSearch()
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSearch])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }
      setIsSearching(true)
      try {
        const data = await globalSearch(query)
        setResults(data)
        setSelectedIndex(0)
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsSearching(false)
      }
    }

    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (result: SearchResult) => {
    router.push(result.url)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => (i - 1 + results.length) % results.length)
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex])
    }
  }

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'student': return <GraduationCap className="h-4 w-4" />
      case 'parent': return <Users className="h-4 w-4" />
      case 'exam': return <BookOpen className="h-4 w-4" />
      case 'subject': return <BookOpen className="h-4 w-4" />
      default: return <Search className="h-4 w-4" />
    }
  }

  return (
    <>
      <button
        onClick={toggleSearch}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/50 hover:bg-muted transition-colors text-muted-foreground group"
      >
        <Search className="h-4 w-4" />
        <span className="text-sm hidden sm:inline">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">Ctrl</span>K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-card rounded-xl shadow-2xl border overflow-hidden flex flex-col"
            >
              <div className="flex items-center px-4 border-b">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for students, exams, subjects..."
                  className="flex-1 px-4 py-4 bg-transparent outline-none text-base"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[60vh] p-2 space-y-1">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Searching...
                  </div>
                ) : query.length < 2 ? (
                  <div className="p-4 text-center">
                    <Command className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Type at least 2 characters to search</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No results found for "{query}"
                  </div>
                ) : (
                  results.map((result, index) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                        index === selectedIndex ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          index === selectedIndex ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          {getIcon(result.type)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{result.title}</p>
                          <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold opacity-50">
                          {result.type}
                        </span>
                        {index === selectedIndex && <ArrowRight className="h-4 w-4" />}
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="p-3 border-t bg-muted/30 flex items-center justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="bg-muted px-1 rounded border">Enter</kbd> to select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="bg-muted px-1 rounded border">↑↓</kbd> to navigate
                  </span>
                </div>
                <span>ESC to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
