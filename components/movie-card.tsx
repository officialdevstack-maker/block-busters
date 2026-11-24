import Image from "next/image"
import Link from "next/link"
import { Play, Star } from "lucide-react"

import type { Movie } from "@/data/movies"
import { slugify } from "@/lib/browse"

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link
      className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand"
      href={`/title/${movie.slug ?? slugify(movie.title)}`}
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
  )
}
