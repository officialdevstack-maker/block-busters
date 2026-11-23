"use client"

import * as React from "react"
import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function HeaderSearch() {
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  return (
    <>
      <Button
        aria-label="Search"
        className="ml-auto size-10 rounded-full text-muted-foreground sm:hidden"
        onClick={() => setOpen(true)}
        size="icon"
        variant="ghost"
      >
        <Search aria-hidden="true" className="size-5" />
      </Button>

      <form
        action="/browse"
        role="search"
        onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
        onSubmit={() => setOpen(false)}
        className={cn(
          "hidden h-11 min-w-0 items-center gap-2 rounded-full border border-border px-4 transition-colors focus-within:border-brand sm:flex sm:max-w-md sm:flex-1 lg:w-64 lg:flex-none xl:w-80",
          open &&
            "max-sm:absolute max-sm:inset-x-0 max-sm:top-0 max-sm:z-10 max-sm:flex max-sm:h-14 max-sm:rounded-none max-sm:border-0 max-sm:bg-background max-sm:px-3"
        )}
      >
        <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <Input
          ref={inputRef}
          aria-label="Search movies and shows"
          className="h-9 min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-base text-foreground shadow-none focus-visible:border-0 focus-visible:ring-0 sm:text-sm"
          name="q"
          placeholder="Search movies, shows..."
          type="search"
        />
        <Button
          aria-label="Close search"
          className="size-9 shrink-0 rounded-full sm:hidden"
          onClick={() => setOpen(false)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <X aria-hidden="true" className="size-5" />
        </Button>
      </form>
    </>
  )
}
