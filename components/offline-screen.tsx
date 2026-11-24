"use client"

import * as React from "react"
import { RotateCw, WifiOff } from "lucide-react"

import { StateScreen } from "@/components/state-screen"
import { Button } from "@/components/ui/button"

export function OfflineScreen({ onRetry }: { onRetry?: () => void }) {
  React.useEffect(() => {
    const retry = onRetry ?? (() => window.location.reload())
    window.addEventListener("online", retry)
    return () => window.removeEventListener("online", retry)
  }, [onRetry])

  return (
    <StateScreen
      eyebrow="No connection"
      icon={WifiOff}
      title="You’re offline"
      description="Check your Wi-Fi or mobile data, then try again. We’ll reload as soon as you’re back online."
    >
      {onRetry ? (
        <Button
          className="rounded-full bg-brand text-black hover:bg-brand/90"
          onClick={onRetry}
        >
          <RotateCw aria-hidden="true" className="size-4" />
          Try again
        </Button>
      ) : (
        <Button
          className="rounded-full bg-brand text-black hover:bg-brand/90"
          nativeButton={false}
          render={
            // eslint-disable-next-line @next/next/no-html-link-for-pages -- Keep retry usable before page JavaScript loads offline.
            <a href="/" />
          }
        >
          <RotateCw aria-hidden="true" className="size-4" />
          Try again
        </Button>
      )}
    </StateScreen>
  )
}
