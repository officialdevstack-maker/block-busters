export type FranchiseFilm = {
  id: string
  title: string
  year: number
  poster: string
  releaseOrder: number
  chronoOrder: number
}

export type Franchise = {
  id: string
  title: string
  covers: string[]
  films: FranchiseFilm[]
}

const dunePosters = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=700&q=85",
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=85",
]

export const franchises: Franchise[] = [
  {
    id: "dune",
    title: "Dune",
    covers: dunePosters,
    films: [
      { id: "dune-1", title: "Dune", year: 2021, poster: dunePosters[0], releaseOrder: 1, chronoOrder: 1 },
      { id: "dune-2", title: "Dune: Part Two", year: 2024, poster: dunePosters[1], releaseOrder: 2, chronoOrder: 2 },
      { id: "dune-3", title: "Dune: Messiah", year: 2026, poster: dunePosters[2], releaseOrder: 3, chronoOrder: 3 },
    ],
  },
  {
    id: "blade-runner",
    title: "Blade Runner",
    covers: [dunePosters[2], dunePosters[0], dunePosters[1]],
    films: [
      { id: "blade-1", title: "Blade Runner", year: 1982, poster: dunePosters[2], releaseOrder: 1, chronoOrder: 1 },
      { id: "blade-2", title: "Blade Runner 2049", year: 2017, poster: dunePosters[0], releaseOrder: 2, chronoOrder: 2 },
    ],
  },
  {
    id: "silent-shore",
    title: "The Silent Shore",
    covers: [dunePosters[1], dunePosters[2], dunePosters[0]],
    films: [
      { id: "shore-1", title: "The Silent Shore", year: 2025, poster: dunePosters[1], releaseOrder: 1, chronoOrder: 1 },
      { id: "shore-2", title: "The Silent Shore: Origins", year: 2026, poster: dunePosters[2], releaseOrder: 2, chronoOrder: 2 },
      { id: "shore-3", title: "Beyond the Shore", year: 2027, poster: dunePosters[0], releaseOrder: 3, chronoOrder: 3 },
    ],
  },
  {
    id: "midnight-run",
    title: "Midnight Run",
    covers: [dunePosters[0], dunePosters[2], dunePosters[1]],
    films: [
      { id: "midnight-1", title: "Midnight Run", year: 2024, poster: dunePosters[0], releaseOrder: 1, chronoOrder: 1 },
      { id: "midnight-2", title: "Midnight Run: Nightfall", year: 2025, poster: dunePosters[2], releaseOrder: 2, chronoOrder: 2 },
      { id: "midnight-3", title: "Midnight Run: Escape", year: 2026, poster: dunePosters[1], releaseOrder: 3, chronoOrder: 3 },
    ],
  },
]
