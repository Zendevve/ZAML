import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { electronService } from '@/services/electron'
import { storageService } from '@/services/storage'

export function Browse() {
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState<'git' | 'zip'>('git')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const handleInstall = async () => {
    setStatus(null)
    if (!url) {
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
        url,
        addonsFolder: activeInstallation.addonsPath,
        method
      })

      if (result.success) {
        setStatus({ type: 'success', message: `Successfully installed ${result.addonName || 'addon'}` })
        setUrl('')
      } else {
        setStatus({ type: 'error', message: result.error || 'Installation failed' })
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Browse & Install</h1>
        <p className="text-muted-foreground mt-2">Install new addons from Git repositories or ZIP archives</p>
      </header>

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
            <Button onClick={handleInstall} disabled={loading}>
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
    </div>
  )
}
