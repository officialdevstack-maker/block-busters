import { SiteHeader } from "@/components/site-header"
import { SlowConnectionNotice } from "@/components/slow-connection-notice"
import { Skeleton } from "@/components/ui/skeleton"

export default function TitleLoading() {
  return (
    <div aria-busy="true" className="min-h-screen">
      <SiteHeader />
      <Skeleton className="aspect-video w-full bg-zinc-900" />
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-20 w-full max-w-3xl" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton className="h-24 w-full rounded-xl" key={index} />
          ))}
        </div>
      </main>
      <SlowConnectionNotice />
    </div>
  )
}
