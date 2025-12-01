import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Star, Download } from 'lucide-react'
import { RightSidebar } from '@/components/RightSidebar'
import { useNavigate } from 'react-router-dom'

export function Dashboard() {
  const navigate = useNavigate()

  const featuredAddons = [
    {
      name: 'ZenUI',
      description: 'A minimalist, high-performance UI replacement for World of Warcraft.',
      downloads: '1.2M',
      stars: '3.5k',
      tags: ['UI', 'Minimalist'],
      image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=ZenUI' // Placeholder
    },
    {
      name: 'ZenToast',
      description: 'Immersive, toast-style notifications for achievements, loot, and more.',
      downloads: '850k',
      stars: '2.1k',
      tags: ['Notifications', 'Immersion'],
      image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=ZenToast'
    },
    {
      name: 'ZenBags',
      description: 'A clean, all-in-one bag inventory management addon.',
      downloads: '500k',
      stars: '1.8k',
      tags: ['Inventory', 'Bags'],
      image: 'https://placehold.co/600x400/1a1a1a/ffffff?text=ZenBags'
    }
  ]

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to Zen Addons Manager!</h1>
          <div className="flex items-center gap-2 text-muted-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/browse')}>
            <span>Discover addons</span>
            <ArrowRight className="size-4" />
          </div>
        </div>

        {/* Featured Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredAddons.map((addon) => (
            <Card key={addon.name} className="overflow-hidden border-0 bg-card/50 hover:bg-card transition-colors group cursor-pointer">
              <div className="h-48 bg-muted relative">
                {/* Image placeholder */}
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 text-4xl font-bold">
                  {addon.name}
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg mb-2">
                    {addon.name[0]}
                  </div>
                </div>
                <CardTitle>{addon.name}</CardTitle>
                <CardDescription className="line-clamp-2">{addon.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Download className="size-3" />
                    {addon.downloads}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="size-3" />
                    {addon.stars}
                  </span>
                </div>
                <div className="flex gap-2">
                  {addon.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Discover Mods Section (Mock) */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Discover mods</h2>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/browse')}>
            View all <ArrowRight className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Just reusing the same list for visual demo */}
          {featuredAddons.map((addon) => (
            <div key={`${addon.name}-2`} className="flex items-center gap-4 p-4 rounded-lg bg-card/30 hover:bg-card transition-colors cursor-pointer">
              <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                {addon.name[0]}
              </div>
              <div>
                <h3 className="font-bold">{addon.name}</h3>
                <p className="text-xs text-muted-foreground">by Zendevve</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  )
}
