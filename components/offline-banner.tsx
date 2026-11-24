"use client"

import { WifiOff } from "lucide-react"

import { useOnline } from "@/hooks/use-online"

export function OfflineBanner() {
  const online = useOnline()
  if (online) return null

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 bg-zinc-950 px-4 py-2.5 text-xs font-medium text-white"
      role="status"
    >
      <WifiOff aria-hidden="true" className="size-3.5 text-amber-400" />
      You are offline. Some things may not load until you reconnect.
    </div>
  )
}
