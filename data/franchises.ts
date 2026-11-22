export type Franchise = {
  title: string
  count: number
  type: "Movie series" | "TV series"
  image: string
  accent: string
}

export const franchises: Franchise[] = [
  {
    title: "Dune",
    count: 3,
    type: "Movie series",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=85",
    accent: "#d7a84b",
  },
  {
    title: "Blade Runner",
    count: 2,
    type: "Movie series",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=85",
    accent: "#9f5a3d",
  },
  {
    title: "The Silent Shore",
    count: 4,
    type: "TV series",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=700&q=85",
    accent: "#537c91",
  },
  {
    title: "Midnight Run",
    count: 3,
    type: "Movie series",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=85",
    accent: "#b06c4e",
  },
]
