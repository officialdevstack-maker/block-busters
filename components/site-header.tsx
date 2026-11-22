import { Bookmark, ChevronDown, Search, UserRound } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DiscoverSidebar } from '@/components/discover-sidebar'
import { MobileNav } from '@/components/mobile-nav'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-4 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(220px,1fr)_auto_minmax(220px,1fr)]">
        <form
          action="/"
          role="search"
          className="flex h-11 w-full max-w-sm items-center gap-3 rounded-full border border-border bg-transparent px-4 transition-colors focus-within:border-brand"
        >
          <MobileNav>
            <DiscoverSidebar />
          </MobileNav>
          <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <Input
            aria-label="Search movies and shows"
            className="h-9 min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-sm text-foreground shadow-none focus-visible:border-0 focus-visible:ring-0"
            name="q"
            placeholder="Search movies, shows..."
            type="search"
          />
          <Button
            aria-label="Submit search"
            className="rounded-full p-1 text-muted-foreground hover:text-brand"
            size="icon-xs"
            type="submit"
            variant="ghost"
          >
            <Search aria-hidden="true" className="size-4" />
          </Button>
        </form>

        <nav
          aria-label="Browse categories and genres"
          className="flex min-w-0 items-center justify-center gap-1 overflow-x-auto sm:col-span-2 sm:row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-1"
        >
          <Button
            aria-current="page"
            className="h-9 shrink-0 rounded-full bg-brand px-3.5 text-xs normal-case tracking-normal text-black"
            nativeButton={false}
            render={<Link href="/" />}
            size="sm"
            variant="default"
          >
            Discover
          </Button>
          <Button
            className="h-9 shrink-0 rounded-full px-3.5 text-xs normal-case tracking-normal text-muted-foreground"
            nativeButton={false}
            render={<Link href="/?category=movies" />}
            size="sm"
            variant="ghost"
          >
            Movies
          </Button>
          <Button
            className="h-9 shrink-0 rounded-full px-3.5 text-xs normal-case tracking-normal text-muted-foreground"
            nativeButton={false}
            render={<Link href="/?category=series" />}
            size="sm"
            variant="ghost"
          >
            Series
          </Button>
          <Button
            className="hidden h-9 shrink-0 rounded-full px-3.5 text-xs normal-case tracking-normal text-muted-foreground md:inline-flex"
            nativeButton={false}
            render={<Link href="/?genre=action" />}
            size="sm"
            variant="ghost"
          >
            Action
          </Button>
          <Button
            className="hidden h-9 shrink-0 rounded-full px-3.5 text-xs normal-case tracking-normal text-muted-foreground md:inline-flex"
            nativeButton={false}
            render={<Link href="/?genre=drama" />}
            size="sm"
            variant="ghost"
          >
            Drama
          </Button>
          <details className="group relative shrink-0">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-full px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600">
              More
              <ChevronDown
                aria-hidden="true"
                className="size-3.5 transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="absolute right-0 top-full z-30 mt-2 min-w-44 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl">
              {['Comedy', 'Sci-Fi', 'Thriller', 'Documentary'].map((genre) => (
                <Button
                  className="h-9 w-full justify-start rounded-lg px-3 text-sm normal-case tracking-normal text-muted-foreground"
                  nativeButton={false}
                  render={<Link href={`/?genre=${genre.toLowerCase()}`} />}
                  size="sm"
                  variant="ghost"
                  key={genre}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </details>
        </nav>

        <div className="flex items-center justify-end gap-2 sm:col-start-2 sm:row-start-1 lg:col-start-3">
          <Button
            className="h-10 gap-2 rounded-full px-3 text-sm normal-case tracking-normal text-muted-foreground"
            nativeButton={false}
            render={<Link href="/watchlist" />}
            size="sm"
            variant="ghost"
          >
            <Bookmark aria-hidden="true" className="size-4" />
            <span className="hidden xl:inline">My list</span>
          </Button>
          <Button
            className="h-10 gap-2 rounded-full bg-brand px-4 text-sm normal-case tracking-normal text-black hover:brightness-105"
            nativeButton={false}
            render={<Link href="/login" />}
            size="sm"
            variant="default"
          >
            <UserRound aria-hidden="true" className="size-4" />
            Sign in
          </Button>
        </div>
      </div>
    </header>
  )
}
