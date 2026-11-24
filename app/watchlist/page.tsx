import type { Metadata } from "next"
import Link from "next/link"
import { Bookmark, Compass } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { StateScreen } from "@/components/state-screen"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "My list · Block Busters",
}

export default function WatchlistPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <StateScreen
          eyebrow="My list"
          icon={Bookmark}
          title="Nothing saved yet"
          description="Tap the + on any title and it will show up here, ready for movie night."
        >
          <Button
            className="rounded-full bg-brand text-black hover:bg-brand/90"
            nativeButton={false}
            render={<Link href="/browse" />}
          >
            <Compass aria-hidden="true" className="size-4" />
            Browse titles
          </Button>
        </StateScreen>
      </main>
    </div>
  )
}
