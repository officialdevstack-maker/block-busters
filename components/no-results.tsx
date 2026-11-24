import Link from "next/link"
import { SearchX } from "lucide-react"

import { StateScreen } from "@/components/state-screen"
import { Button } from "@/components/ui/button"
import { browseHref, genres, type BrowseParams } from "@/lib/browse"

export function NoResults({ params }: { params: BrowseParams }) {
  const { q, genre } = params

  return (
    <div>
      <StateScreen
        compact
        icon={SearchX}
        title={q ? `No results for “${q}”` : "No titles match"}
        description={
          q
            ? "Check the spelling, or try a shorter or more general search."
            : "Nothing matches these filters yet. Try a different genre."
        }
      >
        {q && (
          <Button
            className="rounded-full bg-brand text-black hover:bg-brand/90"
            nativeButton={false}
            render={<Link href={browseHref(params, { q: undefined })} />}
          >
            Clear search
          </Button>
        )}
        {genre && (
          <Button
            className="rounded-full"
            nativeButton={false}
            render={<Link href={browseHref(params, { genre: undefined })} />}
            variant="outline"
          >
            Clear genre
          </Button>
        )}
        <Button
          className="rounded-full"
          nativeButton={false}
          render={<Link href="/browse" />}
          variant="ghost"
        >
          Browse all
        </Button>
      </StateScreen>

      <div className="mx-auto -mt-8 max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Try a genre
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {genres.map((name) => (
            <Link
              className="inline-flex h-9 items-center rounded-full border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:border-brand hover:bg-brand/10 hover:text-foreground"
              href={browseHref({}, { genre: name.toLowerCase() })}
              key={name}
            >
              {name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
