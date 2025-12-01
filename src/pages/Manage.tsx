import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Check, X, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react'

// Mock addon data
const mockAddons = [
  {
    id: '1',
    name: 'AtlasLoot',
    version: '1.2.3',
    branch: 'main',
    status: 'enabled' as const,
    lastUpdated: new Date('2024-11-28').toISOString(),
    sourceUrl: 'https://github.com/Hoizame/AtlasLootClassic',
  },
  {
    id: '2',
    name: 'Questie',
    version: '8.5.2',
    branch: 'master',
    status: 'enabled' as const,
    lastUpdated: new Date('2024-11-25').toISOString(),
    sourceUrl: 'https://github.com/Questie/Questie',
  },
  {
    id: '3',
    name: 'pfQuest',
    version: '4.3.1',
    branch: 'main',
    status: 'outdated' as const,
    lastUpdated: new Date('2024-10-15').toISOString(),
    sourceUrl: 'https://github.com/shagu/pfQuest',
  },
  {
    id: '4',
    name: 'WeakAuras',
    version: '3.2.0',
    branch: 'main',
    status: 'disabled' as const,
    lastUpdated: new Date('2024-11-20').toISOString(),
  },
]

export function Manage() {
  const [addons] = useState(mockAddons)
  const [search, setSearch] = useState('')

  const stats = {
    total: addons.length,
    enabled: addons.filter(a => a.status === 'enabled').length,
    disabled: addons.filter(a => a.status === 'disabled').length,
    outdated: addons.filter(a => a.status === 'outdated').length,
  }

  const filteredAddons = addons.filter(addon =>
    addon.name.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enabled':
        return <Check className="text-green-500 size-5" />
      case 'disabled':
        return <X className="text-muted-foreground size-5" />
      case 'outdated':
        return <AlertTriangle className="text-yellow-500 size-5" />
      default:
        return null
    }
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Manage Addons</h1>
          <p className="text-muted-foreground">{stats.total} addons installed</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 size-4" />
            Update All
          </Button>
          <Input
            placeholder="Search addons..."
            className="w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Stats */}
      <div className="flex gap-6 pb-4 border-b border-border">
        <div className="flex items-center gap-2 text-sm">
          <Check className="text-green-500" />
          <span>{stats.enabled} Enabled</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <X className="text-muted-foreground" />
          <span>{stats.disabled} Disabled</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="text-yellow-500" />
          <span>{stats.outdated} Updates</span>
        </div>
      </div>

      {/* Addon Table */}
      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAddons.map((addon) => (
              <TableRow key={addon.id}>
                <TableCell>{getStatusIcon(addon.status)}</TableCell>
                <TableCell>
                  <div className="font-medium">{addon.name}</div>
                  {addon.sourceUrl && (
                    <a
                      href={addon.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary hover:underline font-mono"
                    >
                      {addon.sourceUrl}
                    </a>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs">{addon.version}</TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">{addon.branch}</span>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {new Date(addon.lastUpdated).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {addon.status === 'outdated' && (
                      <Button size="sm">Update</Button>
                    )}
                    <Button variant="ghost" size="sm">
                      {addon.status === 'enabled' ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
