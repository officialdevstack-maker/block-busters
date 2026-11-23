import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Play, Plus, Star } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { movies } from "@/data/movies"
import { slugify } from "@/lib/browse"

export function generateStaticParams() {
  return movies.map((movie) => ({ slug: slugify(movie.title) }))
}

export default async function TitlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const movie = movies.find((item) => slugify(item.title) === slug)

  if (!movie) notFound()

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Button
          className="mb-4 h-9 rounded-full"
          nativeButton={false}
          render={<Link href="/browse" />}
          size="sm"
          variant="ghost"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to browse
        </Button>

        <article className="grid gap-6 overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
          <div className="relative min-h-[420px] overflow-hidden sm:min-h-[520px]">
            <Image
              alt={`${movie.title} backdrop`}
              className="object-cover"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 65vw"
              src={movie.image}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-9">
              <div className="mb-3 flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-amber-300">
                  <Star aria-hidden="true" className="size-4 fill-current" />
                  {movie.rating}
                </span>
                <span>{movie.year}</span>
                <span>{movie.duration}</span>
                <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs">
                  {movie.type === "series" ? "Series" : "Movie"}
                </span>
              </div>
              <h1 className="max-w-xl text-4xl font-semibold sm:text-6xl">{movie.title}</h1>
              <div className="mt-5 flex items-center gap-2">
                <Button className="h-11 rounded-full bg-brand px-5 text-black">
                  <Play aria-hidden="true" className="size-4 fill-current" />
                  Watch now
                </Button>
                <Button
                  aria-label={`Add ${movie.title} to my list`}
                  className="size-11 rounded-full border-white/20 bg-black/25 text-white"
                  size="icon"
                  variant="outline"
                >
                  <Plus aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              {movie.genre}
            </p>
            <h2 className="mt-2 text-xl font-semibold">About</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Follow {movie.title}, a {movie.genre.toLowerCase()} {movie.type} from {movie.year}.
            </p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between border-b border-border pb-3">
                <dt className="text-muted-foreground">Genre</dt>
                <dd>{movie.genre}</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <dt className="text-muted-foreground">Release</dt>
                <dd>{movie.year}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Duration</dt>
                <dd>{movie.duration}</dd>
              </div>
            </dl>
          </div>
        </article>
      </main>
    </div>
  )
}
