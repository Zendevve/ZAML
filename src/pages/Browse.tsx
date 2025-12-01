import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Loader2, CheckCircle, XCircle, Search, Star, Github } from 'lucide-react'
import { electronService } from '@/services/electron'
import { storageService } from '@/services/storage'

interface SearchResult {
  name: string
  full_name: string
  description: string
  url: string
  stars: number
  author: string
  updated_at: string
}

export function Browse() {
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState<'git' | 'zip'>('git')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleInstall = async (installUrl: string = url) => {
    setStatus(null)
    if (!installUrl) {
      setStatus({ type: 'error', message: 'Please enter a URL' })
      return
    }

    const activeInstallation = storageService.getActiveInstallation()
    if (!activeInstallation) {
      setStatus({ type: 'error', message: 'No active WoW installation found. Please configure one in Settings.' })
      return
    }

    setLoading(true)
    try {
      const result = await electronService.installAddon({
        url: installUrl,
        addonsFolder: activeInstallation.addonsPath,
        method: 'git' // Default to git for search results
      })

      if (result.success) {
        setStatus({ type: 'success', message: `Successfully installed ${result.addonName || 'addon'}` })
        if (installUrl === url) setUrl('')
      } else {
        setStatus({ type: 'error', message: result.error || 'Installation failed' })
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setHasSearched(true)
    setSearchResults([])

    try {
      const result = await electronService.searchGithub(searchQuery)
      if (result.success && result.results) {
        setSearchResults(result.results)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Browse & Install</h1>
        <p className="text-muted-foreground mt-2">Discover and install addons from GitHub</p>
      </header>

      {/* Manual Install Card */}
      <Card>
        <CardHeader>
          <CardTitle>Install from URL</CardTitle>
          <CardDescription>
            Enter the URL of the addon repository or ZIP file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="https://github.com/username/repo"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <Select value={method} onValueChange={(v: 'git' | 'zip') => setMethod(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="git">Git Repository</SelectItem>
                <SelectItem value="zip">ZIP Archive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => handleInstall(url)} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="mr-2 size-4" />
                  Install
                </>
              )}
            </Button>
          </div>

          {status && (
            <div className={`flex items-center gap-2 text-sm p-4 rounded-md ${status.type === 'success' ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-600'
              }`}>
              {status.type === 'success' ? (
                <CheckCircle className="size-4" />
              ) : (
                <XCircle className="size-4" />
              )}
              <span>{status.message}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              className="pl-9"
              placeholder="Search GitHub for addons (e.g. 'plates', 'unit frames')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? <Loader2 className="size-4 animate-spin" /> : 'Search'}
          </Button>
        </div>

        {/* Featured Addons (Only show if no search results yet) */}
        {!hasSearched && (
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Featured Addons</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'ZenUI',
                  description: 'A minimalist, high-performance UI replacement for World of Warcraft.',
                  url: 'https://github.com/Zendevve/ZenUI'
                },
                {
                  name: 'ZenToast',
                  description: 'Immersive, toast-style notifications for achievements, loot, and more.',
                  url: 'https://github.com/Zendevve/ZenToast'
                },
                {
                  name: 'ZenBags',
                  description: 'A clean, all-in-one bag inventory management addon.',
                  url: 'https://github.com/Zendevve/ZenBags'
                }
              ].map((addon) => (
                <Card key={addon.name} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{addon.name}</CardTitle>
                    <CardDescription>{addon.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-0">
                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={() => handleInstall(addon.url)}
                      disabled={loading}
                    >
                      <Download className="mr-2 size-4" />
                      Install
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {searchResults.length > 0
                ? `Found ${searchResults.length} results`
                : 'No results found'}
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {searchResults.map((result) => (
                <Card key={result.url}>
                  <CardContent className="p-6 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{result.name}</h3>
                        <div className="flex items-center text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                          <Star className="size-3 mr-1 fill-current" />
                          {result.stars}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{result.description || 'No description provided.'}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                        <span className="flex items-center gap-1">
                          <Github className="size-3" />
                          {result.author}
                        </span>
                        <span>Updated: {new Date(result.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleInstall(result.url)}
                      disabled={loading}
                    >
                      <Download className="mr-2 size-4" />
                      Install
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
