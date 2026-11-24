"use client"

import Image from "next/image"
import { Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StateScreen } from "@/components/state-screen"
import { Card } from "@/components/ui/card"
import type { Movie } from "@/data/movies"

type ContinueWatchingProps = {
  movies: Movie[]
}

const progressValues = [68, 42, 81, 27]

export function ContinueWatching({ movies }: ContinueWatchingProps) {
  const watching = movies.slice(0, 4)

  if (watching.length === 0) {
    return (
      <StateScreen
        compact
        icon={Play}
        title="Nothing to continue yet"
        description="Start a title and it will appear here so you can pick up where you left off."
      />
    )
  }

  return (
    <Card className="rounded-2xl py-5">
      <div className="flex items-center justify-between px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Your activity
          </p>
          <h2 className="mt-1 text-lg font-semibold">Continue watching</h2>
        </div>
        <Button
          className="h-8 rounded-full px-3 text-xs normal-case tracking-normal"
          size="sm"
          variant="ghost"
        >
          View all
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto px-5 pb-1">
        {watching.map((movie, index) => {
          const progress = progressValues[index] ?? 50

          return (
            <article
              className="group min-w-[210px] flex-1 overflow-hidden rounded-xl border border-border bg-card sm:min-w-[230px]"
              key={movie.title}
            >
              <div className="relative h-28 overflow-hidden bg-zinc-900">
                <Image
                  alt=""
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  fill
                  sizes="(max-width: 640px) 210px, 230px"
                  src={movie.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <Button
                  aria-label={`Continue watching ${movie.title}`}
                  className="absolute bottom-3 left-3 size-9 rounded-full bg-white text-black shadow-lg hover:bg-amber-300"
                  size="icon"
                >
                  <Play aria-hidden="true" className="size-4 fill-current" />
                </Button>
              </div>

              <div className="px-3 pb-3 pt-2.5">
                <h3 className="truncate text-sm font-semibold">{movie.title}</h3>
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {movie.year} · {movie.genre}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </Card>
  )
}
