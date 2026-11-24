"use client"

import * as React from "react"
import Link from "next/link"
import { RotateCw, TriangleAlert } from "lucide-react"

import { OfflineScreen } from "@/components/offline-screen"
import { StateScreen } from "@/components/state-screen"
import { Button } from "@/components/ui/button"
import { useOnline } from "@/hooks/use-online"

export default function Error({
  error,
  retry,
}: {
  error: unknown
  retry: () => void
}) {
  const online = useOnline()

  React.useEffect(() => {
    console.error("Page rendering failed:", error)
  }, [error])

  if (!online) return <OfflineScreen onRetry={retry} />

  return (
    <StateScreen
      eyebrow="Something went wrong"
      icon={TriangleAlert}
      title="We couldn’t load this page"
      description="It’s on our side, not yours. Try again, or head back home."
    >
      <Button
        className="rounded-full bg-brand text-black hover:bg-brand/90"
        onClick={retry}
      >
        <RotateCw aria-hidden="true" className="size-4" />
        Try again
      </Button>
      <Button
        className="rounded-full"
        nativeButton={false}
        render={<Link href="/" />}
        variant="outline"
      >
        Back to home
      </Button>
    </StateScreen>
  )
}
