import type { Metadata } from "next"
import Link from "next/link"
import { Clapperboard, Compass, House } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { StateScreen } from "@/components/state-screen"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Page not found · Block Busters",
}

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <StateScreen
          eyebrow="Error 404"
          icon={Clapperboard}
          title="This scene was cut"
          description="The page you’re looking for doesn’t exist, or the title has been removed."
        >
          <Button
            className="rounded-full bg-brand text-black hover:bg-brand/90"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <House aria-hidden="true" className="size-4" />
            Back to home
          </Button>
          <Button
            className="rounded-full"
            nativeButton={false}
            render={<Link href="/browse" />}
            variant="outline"
          >
            <Compass aria-hidden="true" className="size-4" />
            Browse titles
          </Button>
        </StateScreen>
      </main>
    </div>
  )
}
