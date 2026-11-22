"use client"

import * as React from "react"
import Image from "next/image"
import { motion, type PanInfo } from "framer-motion"
import { Play, Plus, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Movie } from "@/data/movies"

const VISIBLE = 3
const X_STEP = 7
const SCALE_STEP = 0.055

type MovieStackProps = {
  movies: Movie[]
}

export function MovieStack({ movies }: MovieStackProps) {
  const [index, setIndex] = React.useState(0)
  const total = movies.length

  const next = React.useCallback(
    () => setIndex((current) => (current + 1) % total),
    [total]
  )
  const prev = React.useCallback(
    () => setIndex((current) => (current - 1 + total) % total),
    [total]
  )

  React.useEffect(() => {
    const interval = window.setInterval(next, 6000)
    return () => window.clearInterval(interval)
  }, [next])

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -80) next()
    if (info.offset.x > 80) prev()
  }

  return (
    <section className="flex h-full flex-col">
      <div
        className="relative h-[300px] w-full sm:h-[340px]"
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured movies"
      >
        {movies.map((movie, movieIndex) => {
          const offset = (movieIndex - index + total) % total
          const isActive = offset === 0
          const isVisible = offset < VISIBLE

          return (
            <motion.article
              key={movie.title}
              aria-label={`${movie.title}, ${movie.year}`}
              animate={{
                x: `${offset * X_STEP}%`,
                y: offset * 5,
                scale: 1 - offset * SCALE_STEP,
                opacity: isVisible ? 1 - offset * 0.22 : 0,
                zIndex: total - offset,
              }}
              drag={isActive ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              initial={false}
              onDragEnd={isActive ? handleDragEnd : undefined}
              onClick={() => !isActive && setIndex(movieIndex)}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              style={{ transformOrigin: "center left" }}
              className={`absolute inset-y-0 left-0 w-[94%] overflow-hidden rounded-[1.75rem] bg-zinc-900 shadow-[0_24px_70px_-32px_rgba(24,24,27,0.8)] ${
                isActive ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
              }`}
            >
              <Image
                alt=""
                className="pointer-events-none object-cover"
                draggable={false}
                fill
                priority={isActive}
                sizes="(max-width: 640px) 82vw, (max-width: 1024px) 68vw, 52vw"
                src={movie.image}
              />
              <motion.div
                animate={{ opacity: isActive ? 0 : 0.34 }}
                className="pointer-events-none absolute inset-0 bg-black"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

              <div
                className="absolute left-5 top-5 rounded-full px-3 py-1.5 text-xs font-bold text-black"
                style={{ backgroundColor: movie.accent }}
              >
                {isActive ? "Editors' choice" : `${offset + 1} cards away`}
              </div>

              <motion.div
                animate={{ opacity: isActive ? 1 : 0 }}
                className="absolute inset-x-0 bottom-0 p-5 sm:p-7"
              >
                <div className="mb-3 flex items-center gap-3 text-xs font-semibold text-white/90">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Star aria-hidden="true" className="size-3.5 fill-current" />
                    {movie.rating}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-white/50" />
                  <span>{movie.year}</span>
                  <span className="h-1 w-1 rounded-full bg-white/50" />
                  <span>{movie.duration}</span>
                </div>
                <h2 className="max-w-[12ch] font-heading text-3xl leading-[0.95] font-semibold tracking-tight text-white sm:text-5xl">
                  {movie.title}
                </h2>
                <div className="mt-5 flex items-center gap-2">
                  <Button
                    className="pointer-events-auto h-11 rounded-full bg-amber-400 px-5 text-sm text-black hover:bg-amber-300"
                    size="sm"
                  >
                    <Play aria-hidden="true" className="size-4 fill-current" />
                    Watch now
                  </Button>
                  <Button
                    aria-label={`Add ${movie.title} to my list`}
                    className="pointer-events-auto size-11 rounded-full border-white/20 bg-black/25 text-white backdrop-blur-md hover:bg-white/20"
                    size="icon"
                    variant="outline"
                  >
                    <Plus aria-hidden="true" className="size-5" />
                  </Button>
                </div>
              </motion.div>
            </motion.article>
          )
        })}
      </div>

    </section>
  )
}
