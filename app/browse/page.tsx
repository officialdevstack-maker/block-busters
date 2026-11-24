import { Suspense } from "react"
import { connection } from "next/server"
import Link from "next/link"

import { MovieCard } from "@/components/movie-card"
import { NoResults } from "@/components/no-results"
import { SlowConnectionNotice } from "@/components/slow-connection-notice"
import { SiteHeader } from "@/components/site-header"
import { Skeleton } from "@/components/ui/skeleton"
import {
  browseHref,
  genres,
  getTitles,
  sorts,
  type BrowseParams,
} from "@/lib/browse"

const pill = "h-9 shrink-0 inline-flex items-center rounded-full border px-4 text-sm font-medium transition-colors"
const pillIdle = "border-border text-muted-foreground hover:border-brand hover:bg-brand/10 hover:text-foreground"
const pillActive = "border-brand bg-brand text-black"

async function Results({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = (await searchParams) as BrowseParams
  await connection()
  const titles = await getTitles(params)
  const heading = params.genre
    ? `${params.genre[0].toUpperCase()}${params.genre.slice(1)}`
    : params.q
      ? `Results for "${params.q}"`
      : "All titles"

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{heading}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{titles.length} titles</p>
        </div>
      </div>

      <nav
        aria-label="Filter by genre"
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Link
          className={`${pill} ${!params.genre ? pillActive : pillIdle}`}
          href={browseHref(params, { genre: undefined })}
        >
          All
        </Link>
        {genres.map((genre) => (
          <Link
            className={`${pill} ${params.genre?.toLowerCase() === genre.toLowerCase() ? pillActive : pillIdle}`}
            href={browseHref(params, { genre: genre.toLowerCase() })}
            key={genre}
          >
            {genre}
          </Link>
        ))}
      </nav>

      <nav aria-label="Sort" className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Sort by</span>
        {sorts.map((sort) => (
          <Link
            aria-current={(params.sort ?? "") === sort.value ? "true" : undefined}
            className={`rounded-full px-3 py-1 ${(params.sort ?? "") === sort.value ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            href={browseHref(params, { sort: sort.value || undefined })}
            key={sort.label}
          >
            {sort.label}
          </Link>
        ))}
      </nav>

      {titles.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {titles.map((movie) => (
            <MovieCard key={movie.title} movie={movie} />
          ))}
        </div>
      ) : (
        <NoResults params={params} />
      )}
    </>
  )
}

function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-9 w-full max-w-lg rounded-full" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton className="aspect-[2/3] rounded-xl" key={index} />
        ))}
      </div>
      <SlowConnectionNotice />
    </div>
  )
}

export default function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <Suspense fallback={<ResultsSkeleton />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  )
}
