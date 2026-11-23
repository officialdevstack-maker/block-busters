import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

import type { Movie } from "@/data/movies"
import { slugify } from "@/lib/browse"

export function RelatedList({ movies }: { movies: Movie[] }) {
  return (
    <aside aria-label="Related titles">
      <h2 className="mb-3 text-lg font-semibold">More like this</h2>
      <ul className="space-y-3">
        {movies.map((movie) => (
          <li key={movie.title}>
            <Link
              className="group flex gap-3 rounded-xl p-1.5 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-brand"
              href={`/title/${slugify(movie.title)}`}
            >
              <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="144px"
                  src={movie.image}
                />
                <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {movie.duration}
                </span>
              </div>
              <div className="min-w-0 py-0.5">
                <h3 className="line-clamp-2 text-sm font-medium">{movie.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {movie.year} · {movie.genre}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-brand">
                  <Star aria-hidden="true" className="size-3 fill-current" />
                  {movie.rating}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
