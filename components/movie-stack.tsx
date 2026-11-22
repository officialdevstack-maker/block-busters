"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play, Plus, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

type Movie = {
  title: string
  year: string
  rating: string
  genre: string
  duration: string
  image: string
  accent: string
}

const movies: Movie[] = [
  {
    title: "Dune: Part Two",
    year: "2024",
    rating: "8.6",
    genre: "Sci-Fi",
    duration: "2h 46m",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85",
    accent: "#e7a91a",
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
  },
]

const categories = ["New releases", "Trending", "Top rated"]

export function MovieStack() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [activeCategory, setActiveCategory] = React.useState(categories[0])

  React.useEffect(() => {
    if (!api) return

    const onSelect = () => setSelectedIndex(api.selectedScrollSnap())
    const initialize = window.requestAnimationFrame(onSelect)
    api.on("select", onSelect)
    api.on("reInit", onSelect)

    return () => {
      window.cancelAnimationFrame(initialize)
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api])

  const changeCategory = (category: string) => {
    setActiveCategory(category)
    api?.scrollTo(0)
  }

  return (
    <section className="flex h-full min-h-[580px] flex-col px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">
            Discover
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {activeCategory}
          </h1>
        </div>

        <div
          aria-label="Movie categories"
          className="flex items-center gap-1 rounded-full border border-border bg-muted/50 p-1"
        >
          {categories.map((category) => (
            <Button
              aria-pressed={activeCategory === category}
              className={`h-8 rounded-full px-3 text-[11px] normal-case tracking-normal ${
                activeCategory === category
                  ? "bg-amber-400 text-black hover:bg-amber-300"
                  : "text-muted-foreground"
              }`}
              key={category}
              onClick={() => changeCategory(category)}
              size="xs"
              variant="ghost"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <Carousel
        className="min-h-0 flex-1"
        opts={{ align: "start", containScroll: "trimSnaps", dragFree: false }}
        setApi={setApi}
      >
        <CarouselContent className="-ml-3 items-stretch">
          {movies.map((movie, index) => (
            <CarouselItem
              className="pl-3 basis-[88%] sm:basis-[68%] md:basis-[58%] lg:basis-[52%]"
              key={movie.title}
            >
              <article
                className="relative h-[470px] overflow-hidden rounded-[1.75rem] bg-zinc-900 shadow-[0_24px_70px_-32px_rgba(24,24,27,0.8)] sm:h-[520px]"
                aria-label={`${movie.title}, ${movie.year}`}
              >
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  priority={index === 0}
                  sizes="(max-width: 640px) 88vw, (max-width: 1024px) 68vw, 52vw"
                  src={movie.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div
                  className="absolute left-5 top-5 rounded-full px-3 py-1.5 text-xs font-bold text-black"
                  style={{ backgroundColor: movie.accent }}
                >
                  {index === 0 ? "Editors' choice" : `${index + 1} of ${movies.length}`}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                  <div className="mb-3 flex items-center gap-3 text-xs font-semibold text-white/90">
                    <span className="flex items-center gap-1 text-amber-300">
                      <Star aria-hidden="true" className="size-3.5 fill-current" />
                      {movie.rating}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-white/50" />
                    <span>{movie.year}</span>
                    <span className="h-1 w-1 rounded-full bg-white/50" />
                    <span>{movie.duration}</span>
                  </div>
                  <h2 className="max-w-[12ch] font-heading text-3xl leading-[0.95] font-semibold tracking-tight text-white sm:text-5xl">
                    {movie.title}
                  </h2>
                  <div className="mt-5 flex items-center gap-2">
                    <Button
                      className="h-11 rounded-full bg-amber-400 px-5 text-sm text-black hover:bg-amber-300"
                      size="sm"
                    >
                      <Play aria-hidden="true" className="size-4 fill-current" />
                      Watch now
                    </Button>
                    <Button
                      aria-label={`Add ${movie.title} to my list`}
                      className="size-11 rounded-full border-white/20 bg-black/25 text-white backdrop-blur-md hover:bg-white/20"
                      size="icon"
                      variant="outline"
                    >
                      <Plus aria-hidden="true" className="size-5" />
                    </Button>
                  </div>
                </div>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5" aria-label="Carousel position">
            {movies.map((movie, index) => (
              <button
                aria-label={`Go to ${movie.title}`}
                aria-current={selectedIndex === index ? "true" : undefined}
                className={`h-1.5 rounded-full transition-all ${
                  selectedIndex === index
                    ? "w-8 bg-amber-500"
                    : "w-1.5 bg-border hover:bg-muted-foreground"
                }`}
                key={movie.title}
                onClick={() => api?.scrollTo(index)}
                type="button"
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              aria-label="Previous movie"
              className="size-10 rounded-full"
              onClick={() => api?.scrollPrev()}
              size="icon"
              variant="outline"
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              aria-label="Next movie"
              className="size-10 rounded-full"
              onClick={() => api?.scrollNext()}
              size="icon"
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </Carousel>
    </section>
  )
}
