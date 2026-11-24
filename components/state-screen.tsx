import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type StateScreenProps = {
  icon: LucideIcon
  title: string
  description: ReactNode
  eyebrow?: string
  compact?: boolean
  className?: string
  children?: ReactNode
}

export function StateScreen({
  icon: Icon,
  title,
  description,
  eyebrow,
  compact = false,
  className,
  children,
}: StateScreenProps) {
  const Heading = compact ? "h2" : "h1"

  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-md flex-col items-center px-4 text-center",
        compact ? "py-16" : "min-h-[calc(100svh-8rem)] justify-center py-16",
        className
      )}
    >
      <div className="relative isolate mb-6">
        <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-brand/15 blur-2xl" />
        <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-card text-brand">
          <Icon aria-hidden="true" className="size-8" />
        </div>
      </div>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          {eyebrow}
        </p>
      )}
      <Heading className="mt-1 font-heading text-2xl font-semibold sm:text-3xl">
        {title}
      </Heading>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {children}
        </div>
      )}
    </section>
  )
}
