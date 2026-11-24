"use client"

import * as React from "react"
import { RotateCw, WifiLow } from "lucide-react"

import { Button } from "@/components/ui/button"

const SLOW_AFTER_MS = 4000

type NetworkInformation = {
  effectiveType?: string
  saveData?: boolean
}

export function SlowConnectionNotice() {
  const [slow, setSlow] = React.useState(false)

  React.useEffect(() => {
    const connection = (
      navigator as Navigator & { connection?: NetworkInformation }
    ).connection
    const poorNetwork =
      connection?.saveData ||
      ["slow-2g", "2g"].includes(connection?.effectiveType ?? "")
    const timer = window.setTimeout(
      () => setSlow(true),
      poorNetwork ? 0 : SLOW_AFTER_MS
    )
    return () => window.clearTimeout(timer)
  }, [])

  if (!slow) return null

  return (
    <div
      aria-live="polite"
      className="fixed inset-x-3 bottom-4 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-card p-3 pr-4 shadow-lg"
      role="status"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
        <WifiLow aria-hidden="true" className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Slow connection</p>
        <p className="text-xs text-muted-foreground">
          This is taking longer than usual.
        </p>
      </div>
      <Button
        className="rounded-full"
        onClick={() => window.location.reload()}
        size="sm"
        variant="outline"
      >
        <RotateCw aria-hidden="true" className="size-3.5" />
        Retry
      </Button>
    </div>
  )
}
