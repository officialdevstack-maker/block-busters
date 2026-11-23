"use client"

import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const genre = (label: string) => ({
  label,
  href: `/browse?genre=${label.toLowerCase()}`,
})

const primary = [
  { label: "Discover", href: "/" },
  { label: "Movies", href: "/browse?category=movies" },
  { label: "Series", href: "/browse?category=series" },
  genre("Action"),
  genre("Drama"),
]

const more = [
  genre("Comedy"),
  genre("Sci-Fi"),
  genre("Thriller"),
  genre("Documentary"),
]

export function HeaderNav() {
  const pathname = usePathname()
  const params = useSearchParams()

  const isActive = (href: string) => {
    const [path, query] = href.split("?")
    if (pathname !== path) return false
    if (!query) return params.size === 0
    return [...new URLSearchParams(query)].every(
      ([key, value]) => params.get(key) === value
    )
  }

  const pill = (
    item: { label: string; href: string },
    className?: string
  ) => {
    const active = isActive(item.href)
    return (
      <Button
        aria-current={active ? "page" : undefined}
        className={cn(
          "h-9 shrink-0 rounded-full px-3.5 text-xs normal-case tracking-normal",
          active
            ? "bg-brand text-black hover:bg-brand/90"
            : "text-muted-foreground",
          className
        )}
        key={item.label}
        nativeButton={false}
        render={<Link href={item.href} />}
        size="sm"
        variant={active ? "default" : "ghost"}
      >
        {item.label}
      </Button>
    )
  }

  return (
    <nav
      aria-label="Browse categories and genres"
      className="order-last -mx-3 flex w-full items-center gap-1 overflow-x-auto px-3 pb-2.5 [scrollbar-width:none] sm:-mx-4 sm:px-4 lg:order-none lg:mx-0 lg:w-auto lg:flex-1 lg:justify-center lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
    >
      {primary.map((item) => pill(item))}
      {more.map((item) => pill(item, "lg:hidden"))}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              className="hidden h-9 shrink-0 gap-1 rounded-full px-3.5 text-xs normal-case tracking-normal text-muted-foreground lg:inline-flex"
              size="sm"
              variant="ghost"
            />
          }
        >
          More
          <ChevronDown aria-hidden="true" className="size-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          {more.map((item) => (
            <DropdownMenuItem
              key={item.label}
              render={<Link href={item.href} />}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}
