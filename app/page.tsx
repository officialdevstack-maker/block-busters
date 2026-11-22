import { DiscoverSidebar } from '@/components/discover-sidebar'
import { AppBanner } from '@/components/app-banner'
import { ContinueWatching } from '@/components/continue-watching'
import { GenreRow } from '@/components/genre-row'
import { MediaRow } from '@/components/media-row'
import { MovieStack } from '@/components/movie-stack'
import { SiteHeader } from '@/components/site-header'
import { movies } from '@/data/movies'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="discover" className="grid grid-cols-1 items-start gap-3 p-3 md:grid-cols-5">
        <DiscoverSidebar />
        <div className="space-y-10 md:col-span-4">
          <MovieStack movies={movies} />
          <ContinueWatching movies={movies} />
          <GenreRow />
          <MediaRow
            eyebrow="Most popular"
            movies={[...movies].reverse()}
            title="Trending movies & series"
          />
          <MediaRow
            eyebrow="Fan favorites"
            movies={movies}
            title="Top watched"
          />
          <MediaRow
            eyebrow="Fresh this week"
            movies={[...movies].slice(1).concat(movies[0])}
            title="New releases"
          />
          <AppBanner />
          <MediaRow
            eyebrow="Picked for you"
            movies={[...movies].slice(2).concat(movies.slice(0, 2))}
            title="Recommended"
          />
        </div>
      </main>
      <footer className="border-t border-border px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© 2026 Block Busters</p>
          <nav aria-label="Footer navigation" className="flex items-center gap-5">
            <Link className="transition-colors hover:text-foreground" href="/about">
              About
            </Link>
            <Link className="transition-colors hover:text-foreground" href="/privacy">
              Privacy
            </Link>
            <Link className="transition-colors hover:text-foreground" href="/support">
              Support
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
