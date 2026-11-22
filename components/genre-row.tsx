"use client"

const genres = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
]

export function GenreRow() {
  return (
    <section className="border-t border-border pt-6" aria-label="Browse genres">
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
          Browse
        </p>
        <h2 className="mt-1 text-lg font-semibold">All categories</h2>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {genres.map((genre) => (
          <button
            className="h-9 shrink-0 rounded-full border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:border-amber-400 hover:bg-amber-400/10 hover:text-foreground"
            key={genre}
            type="button"
          >
            {genre}
          </button>
        ))}
      </div>
    </section>
  )
}
