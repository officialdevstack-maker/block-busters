import { DiscoverSidebar } from '@/components/discover-sidebar'
import { MovieStack } from '@/components/movie-stack'
import { SiteHeader } from '@/components/site-header'
import { Card } from '@/components/ui/card'

export default function Page() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="discover" className="grid grid-cols-1 items-start gap-3 p-3 md:grid-cols-5">
        <DiscoverSidebar />
        <div className="md:col-span-4">
          <Card className="min-h-[calc(100vh-7rem)] rounded-2xl py-0">
            <MovieStack />
          </Card>
        </div>
      </main>
    </div>
  )
}
