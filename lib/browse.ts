import { movies, type Movie } from "@/data/movies"

export type BrowseParams = {
  genre?: string
  q?: string
  sort?: string
  collection?: string
  category?: "movies" | "series"
}

export const genres = ["Action", "Adventure", "Drama", "Sci-Fi", "Thriller", "Neo-noir"]

export const sorts = [
  { value: "", label: "Popular" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" },
  { value: "az", label: "A-Z" },
]

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

export function getTitles({ genre, q, sort, category }: BrowseParams): Movie[] {
  let list = [...movies]

  if (category) list = list.filter((movie) => movie.type === category)
  if (genre) list = list.filter((movie) => movie.genre.toLowerCase() === genre.toLowerCase())
  if (q) list = list.filter((movie) => movie.title.toLowerCase().includes(q.toLowerCase()))

  if (sort === "rating") list.sort((a, b) => Number(b.rating) - Number(a.rating))
  if (sort === "newest") list.sort((a, b) => Number(b.year) - Number(a.year))
  if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title))

  return list
}

export function browseHref(current: BrowseParams, patch: Partial<BrowseParams>) {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries({ ...current, ...patch })) {
    if (value) sp.set(key, String(value))
  }
  const qs = sp.toString()
  return qs ? `/browse?${qs}` : "/browse"
}
