import { Download, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"

export function AppBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-zinc-950 px-6 py-8 text-white sm:px-9">
      <div className="absolute -right-16 -top-20 size-56 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-zinc-950">
            <Smartphone aria-hidden="true" className="size-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
              Watch anywhere
            </p>
            <h2 className="mt-1 text-xl font-semibold">Get the Block Busters app</h2>
            <p className="mt-1 text-sm text-white/65">
              Download offline and keep watching on the go.
            </p>
          </div>
        </div>
        <Button className="h-10 shrink-0 rounded-full bg-amber-400 px-5 text-sm text-zinc-950 hover:bg-amber-300">
          <Download aria-hidden="true" className="size-4" />
          Download app
        </Button>
      </div>
    </section>
  )
}
