export type Movie = {
  title: string
  year: string
  rating: string
  genre: string
  duration: string
  image: string
  accent: string
  type: "movie" | "series"
}

export const movies: Movie[] = [
  {
    title: "Dune: Part Two",
    year: "2024",
    rating: "8.6",
    genre: "Sci-Fi",
    duration: "2h 46m",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85",
    accent: "#e7a91a",
    type: "movie",
  },
  {
    title: "Blade Runner",
    year: "2017",
    rating: "8.0",
    genre: "Neo-noir",
    duration: "2h 44m",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1400&q=85",
    accent: "#dd5c39",
    type: "movie",
  },
  {
    title: "The Silent Shore",
    year: "2025",
    rating: "7.8",
    genre: "Drama",
    duration: "1h 58m",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85",
    accent: "#5f8ca8",
    type: "series",
  },
  {
    title: "Midnight Run",
    year: "2024",
    rating: "7.5",
    genre: "Thriller",
    duration: "2h 08m",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1400&q=85",
    accent: "#a76a4b",
    type: "movie",
  },
  {
    title: "After the Storm",
    year: "2023",
    rating: "7.2",
    genre: "Adventure",
    duration: "1h 52m",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85",
    accent: "#718b71",
    type: "series",
  },
]
