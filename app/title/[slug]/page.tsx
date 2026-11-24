import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Plus, Share2, Star } from "lucide-react"

import { Comments, type Comment } from "@/components/comments"
import { RelatedList } from "@/components/related-list"
import { SiteHeader } from "@/components/site-header"
import { VideoPlayer } from "@/components/video-player"
import { Button } from "@/components/ui/button"
import { movies } from "@/data/movies"
import { slugify } from "@/lib/browse"
import { SAMPLE_VIDEO, getMovie, getRelated } from "@/lib/titles"
import { spurs } from "@/lib/auth"

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return movies.map((movie) => ({ slug: slugify(movie.title) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const movie = getMovie(slug)
  return {
    title: movie ? `${movie.title} (${movie.year}) · Block Busters` : "Not found",
  }
}

const mockComments: Comment[] = [
  { id: "1", author: "Tolu Adeyemi", body: "The cinematography is unreal. Watched it twice already.", time: "2 hours ago", likes: 24 },
  { id: "2", author: "Chidi Okafor", body: "Slow start but the last 30 minutes are worth it.", time: "1 day ago", likes: 11 },
  { id: "3", author: "Amina Bello", body: "Anyone know if there's a sequel planned?", time: "3 days ago", likes: 3 },
]

async function AuthenticatedComments() {
  const user = await spurs.getUser()
  return (
    <Comments
      authenticated={Boolean(user)}
      initial={mockComments}
      userName={user?.name || user?.email || "You"}
    />
  )
}

export default async function TitlePage({ params }: Props) {
  const { slug } = await params
  const movie = getMovie(slug)
  if (!movie) notFound()

  const related = getRelated(movie)

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <VideoPlayer
        id={slug}
        poster={movie.image}
        src={movie.videoUrl ?? SAMPLE_VIDEO}
        title={movie.title}
      />

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-8">
          <section aria-label="About this title" className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-heading text-2xl font-semibold sm:text-3xl">{movie.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-brand">
                    <Star aria-hidden="true" className="size-4 fill-current" />
                    {movie.rating}
                  </span>
                  <span>{movie.year}</span>
                  <span>{movie.duration}</span>
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-xs">
                    {movie.genre}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="rounded-full" size="sm" variant="outline">
                  <Plus aria-hidden="true" className="size-4" />
                  My list
                </Button>
                <Button className="rounded-full" size="sm" variant="outline">
                  <Share2 aria-hidden="true" className="size-4" />
                  Share
                </Button>
              </div>
            </div>

            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {movie.description ?? `Follow ${movie.title}, a ${movie.genre.toLowerCase()} ${movie.type} from ${movie.year}.`}
            </p>
          </section>

          <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
            <AuthenticatedComments />
          </Suspense>
        </div>

        <RelatedList movies={related} />
      </main>
    </div>
  )
}
