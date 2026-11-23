import { movies, type Movie } from "@/data/movies"
import { slugify } from "@/lib/browse"

export const getMovie = (slug: string) =>
  movies.find((movie) => slugify(movie.title) === slug)

export function getRelated(movie: Movie, limit = 8): Movie[] {
  const others = movies.filter((item) => item.title !== movie.title)
  return [
    ...others.filter((item) => item.genre === movie.genre),
    ...others.filter((item) => item.genre !== movie.genre),
  ].slice(0, limit)
}

export const SAMPLE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
