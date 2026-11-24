import { SiteHeader } from "@/components/site-header"
import { SlowConnectionNotice } from "@/components/slow-connection-notice"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div aria-busy="true" className="min-h-screen">
      <SiteHeader />
      <main className="grid grid-cols-1 items-start gap-3 p-3 md:grid-cols-5">
        <div className="hidden md:block">
          <Skeleton className="h-[calc(100vh-6rem)] rounded-2xl" />
        </div>
        <div className="space-y-10 md:col-span-4">
          <Skeleton className="h-[300px] w-full rounded-[1.75rem] sm:h-[340px]" />
          {Array.from({ length: 3 }).map((_, row) => (
            <div className="space-y-3" key={row}>
              <Skeleton className="h-5 w-40" />
              <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton
                    className="aspect-[2/3] w-[150px] shrink-0 rounded-xl sm:w-[180px]"
                    key={index}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <SlowConnectionNotice />
    </div>
  )
}
