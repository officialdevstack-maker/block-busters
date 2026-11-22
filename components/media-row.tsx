"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Movie } from "@/data/movies"

type MediaRowProps = {
  title: string
  eyebrow: string
  movies: Movie[]
}

export function MediaRow({ title, eyebrow, movies }: MediaRowProps) {
  const rowRef = React.useRef<HTMLDivElement>(null)

  const scrollRow = (direction: "left" | "right") => {
    rowRef.current?.scrollBy({
      left: direction === "left" ? -520 : 520,
      behavior: "smooth",
    })
  }

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

  return (
    <section className="border-t border-border pt-6">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-lg font-semibold">{title}</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            aria-label={`Scroll ${title} left`}
            className="hidden size-8 rounded-full lg:inline-flex"
            onClick={() => scrollRow("left")}
            size="icon"
            variant="outline"
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            aria-label={`Scroll ${title} right`}
            className="hidden size-8 rounded-full lg:inline-flex"
            onClick={() => scrollRow("right")}
            size="icon"
            variant="outline"
          >
            <ChevronRight aria-hidden="true" />
          </Button>
          <Button
            className="h-8 rounded-full px-3 text-xs normal-case tracking-normal"
            nativeButton={false}
            render={<Link href={`/?collection=${slugify(title)}`} />}
            size="sm"
            variant="ghost"
          >
            View all
          </Button>
        </div>
      </div>

      <div
        ref={rowRef}
        className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {movies.map((movie) => (
          <Link
            className="group min-w-[150px] flex-[0_0_150px] snap-start rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand sm:min-w-[180px] sm:flex-[0_0_180px] lg:min-w-[200px] lg:flex-[0_0_200px]"
            href={`/title/${slugify(movie.title)}`}
            key={movie.title}
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-900">
              <Image
                alt={`${movie.title} poster`}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                src={movie.image}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="flex size-11 items-center justify-center rounded-full bg-brand text-black">
                  <Play aria-hidden="true" className="size-5 fill-current" />
                </span>
              </div>
            </div>
            <h3 className="mt-2 truncate text-sm font-medium">{movie.title}</h3>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{movie.year} · {movie.genre}</span>
              <span className="flex items-center gap-1 text-brand">
                <Star aria-hidden="true" className="size-3 fill-current" />
                {movie.rating}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
