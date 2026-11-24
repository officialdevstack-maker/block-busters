import { and, asc, desc, eq, isNotNull } from "drizzle-orm"
import { cacheTag } from "next/cache"

import type { Movie } from "@/data/movies"
import { getDb } from "@/lib/db"
import { titles, videos } from "@/lib/db/schema"
import { mediaUrl } from "@/lib/storage"

function formatDuration(minutes: number | null) {
  if (!minutes) return "—"
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return hours
    ? `${hours}h ${remainingMinutes.toString().padStart(2, "0")}m`
    : `${remainingMinutes}m`
}

function toMovie(
  row: typeof titles.$inferSelect,
  hlsKey?: string | null
): Movie {
  return {
    slug: row.slug,
    title: row.title,
    year: String(row.year),
    rating: row.rating?.toFixed(1) ?? "—",
    genre: row.genre,
    duration: formatDuration(row.durationMin),
    image: row.posterKey ? mediaUrl(row.posterKey) : row.posterUrl ?? "",
    accent: row.accent ?? "#e7a91a",
    type: row.type,
    description: row.description ?? undefined,
    videoUrl: hlsKey ? mediaUrl(hlsKey) : undefined,
  }
}

export async function getAllTitles(): Promise<Movie[]> {
  "use cache"
  cacheTag("titles")
  const rows = await getDb()
    .select()
    .from(titles)
    .where(eq(titles.published, true))
    .orderBy(asc(titles.sortOrder), asc(titles.createdAt))

  return rows.map((row) => toMovie(row))
}

export async function getMovie(slug: string): Promise<Movie | null> {
  "use cache"
  cacheTag("titles", `title:${slug}`)
  const db = getDb()
  const [row] = await db
    .select()
    .from(titles)
    .where(and(eq(titles.slug, slug), eq(titles.published, true)))
    .limit(1)

  if (!row) return null

  const [video] = await db
    .select({ hlsKey: videos.hlsKey })
    .from(videos)
    .where(
      and(
        eq(videos.titleId, row.id),
        eq(videos.status, "ready"),
        isNotNull(videos.hlsKey)
      )
    )
    .orderBy(desc(videos.createdAt))
    .limit(1)

  return toMovie(row, video?.hlsKey)
}

export async function getRelated(
  movie: Movie,
  limit = 8
): Promise<Movie[]> {
  const allTitles = await getAllTitles()
  const others = allTitles.filter((item) => item.title !== movie.title)
  return [
    ...others.filter((item) => item.genre === movie.genre),
    ...others.filter((item) => item.genre !== movie.genre),
  ].slice(0, limit)
}
