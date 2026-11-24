import "dotenv/config"

import { movies } from "../data/movies"
import { closeDb, getDb } from "../lib/db"
import { titles } from "../lib/db/schema"
import { slugify } from "../lib/slugify"

function parseDuration(duration: string) {
  const hours = Number(/(\d+)h/.exec(duration)?.[1] ?? 0)
  const minutes = Number(/(\d+)m/.exec(duration)?.[1] ?? 0)
  return hours * 60 + minutes
}

async function seed() {
  const db = getDb()

  await db
    .insert(titles)
    .values(
      movies.map((movie, sortOrder) => ({
        slug: slugify(movie.title),
        title: movie.title,
        year: Number(movie.year),
        rating: Number(movie.rating),
        genre: movie.genre,
        type: movie.type,
        durationMin: parseDuration(movie.duration),
        description: movie.description,
        posterUrl: movie.image,
        accent: movie.accent,
        sortOrder,
      }))
    )
    .onConflictDoNothing({ target: titles.slug })

  console.log(`Seeded ${movies.length} catalog titles.`)
}

seed()
  .catch((error: unknown) => {
    console.error("Failed to seed the movie catalog:", error)
    process.exitCode = 1
  })
  .finally(closeDb)
