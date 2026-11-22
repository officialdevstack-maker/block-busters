"use client"

import Image from "next/image"
import { Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Movie } from "@/data/movies"

type MediaRowProps = {
  title: string
  eyebrow: string
  movies: Movie[]
}

export function MediaRow({ title, eyebrow, movies }: MediaRowProps) {
  return (
    <section className="border-t border-border pt-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-lg font-semibold">{title}</h2>
        </div>
        <Button
          className="h-8 rounded-full px-3 text-xs normal-case tracking-normal"
          size="sm"
          variant="ghost"
        >
          View all
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {movies.map((movie) => (
          <article
            className="group min-w-[150px] flex-[0_0_150px] sm:min-w-[180px] sm:flex-[0_0_180px] lg:min-w-[200px] lg:flex-[0_0_200px]"
            key={movie.title}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-900">
              <Image
                alt=""
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                src={movie.image}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <h3 className="truncate text-sm font-semibold text-white">{movie.title}</h3>
                <div className="mt-1 flex items-center justify-between text-[11px] text-white/75">
                  <span>{movie.year}</span>
                  <span className="flex items-center gap-1 text-amber-300">
                    <Star aria-hidden="true" className="size-3 fill-current" />
                    {movie.rating}
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
