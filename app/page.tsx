import { connection } from 'next/server'
import { Suspense } from 'react'
import { DiscoverSidebar } from '@/components/discover-sidebar'
import { AppBanner } from '@/components/app-banner'
import { ContinueWatching } from '@/components/continue-watching'
import { FranchiseRow } from '@/components/franchise-row'
import { GenreRow } from '@/components/genre-row'
import { MediaRow } from '@/components/media-row'
import { MovieStack } from '@/components/movie-stack'
import { SiteHeader } from '@/components/site-header'
import { getAllTitles } from '@/lib/titles'
import { franchises } from '@/data/franchises'
import Link from 'next/link'

const layout = [
  'hero',
  'genres',
  'continue',
  'trending',
  'new',
  'christmas',
  'recommended',
  'franchises',
  'nollywood',
  'kdrama',
  'top',
  'series',
  'horror',
  'app-banner',
] as const

function renderSection(
  key: (typeof layout)[number],
  movies: Awaited<ReturnType<typeof getAllTitles>>,
  mediaRows: Record<string, { eyebrow: string; title: string; movies: typeof movies }>
) {
  switch (key) {
    case 'hero':
      return <MovieStack movies={movies} />
    case 'genres':
      return <GenreRow />
    case 'continue':
      return <ContinueWatching movies={movies} />
    case 'franchises':
      return <FranchiseRow franchises={franchises} />
    case 'app-banner':
      return <AppBanner />
    default:
      return <MediaRow {...mediaRows[key]} />
  }
}

async function HomeCatalog() {
  await connection()
  const movies = await getAllTitles()
  const rotate = <T,>(list: T[], by: number) =>
    [...list.slice(by), ...list.slice(0, by)]
  const mediaRows = {
    trending: {
      eyebrow: 'Most popular',
      title: 'Trending movies & series',
      movies: [...movies].reverse(),
    },
    new: {
      eyebrow: 'Fresh this week',
      title: 'New releases',
      movies: rotate(movies, 1),
    },
    christmas: {
      eyebrow: 'Holiday favorites',
      title: 'Christmas movies',
      movies,
    },
    recommended: {
      eyebrow: 'Picked for you',
      title: 'Recommended',
      movies: rotate(movies, 2),
    },
    nollywood: {
      eyebrow: 'Nigerian cinema',
      title: 'Nollywood',
      movies: rotate(movies, 1),
    },
    kdrama: {
      eyebrow: 'Korean stories',
      title: 'K-Drama',
      movies: rotate(movies, 3),
    },
    top: {
      eyebrow: 'Fan favorites',
      title: 'Top watched',
      movies,
    },
    series: {
      eyebrow: 'Binge-worthy',
      title: 'Popular series',
      movies: rotate(movies, 2),
    },
    horror: {
      eyebrow: 'Stay in the dark',
      title: 'Horror',
      movies: [...movies].reverse(),
    },
  }

  if (movies.length === 0) {
    return (
      <main className="px-6 py-24 text-center text-muted-foreground">
        No titles are available yet.
      </main>
    )
  }

  return (
    <main id="discover" className="grid grid-cols-1 items-start gap-3 p-3 md:grid-cols-5">
      <div className="hidden md:sticky md:top-20 md:block md:self-start">
        <DiscoverSidebar />
      </div>
      <div className="space-y-10 md:col-span-4">
        {layout.map((key) => (
          <div key={key}>{renderSection(key, movies, mediaRows)}</div>
        ))}
      </div>
    </main>
  )
}

export default function Page() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Suspense fallback={<main className="px-6 py-24 text-center text-muted-foreground">Loading titles…</main>}>
        <HomeCatalog />
      </Suspense>
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
