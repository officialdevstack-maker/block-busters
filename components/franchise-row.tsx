"use client"

import Image from "next/image"
import { ArrowRight, BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Franchise } from "@/data/franchises"

type FranchiseRowProps = {
  franchises: Franchise[]
}

export function FranchiseRow({ franchises }: FranchiseRowProps) {
  return (
    <section className="border-t border-border pt-6" aria-label="Franchise watch orders">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
            Complete the story
          </p>
          <h2 className="mt-1 text-lg font-semibold">Franchises</h2>
        </div>
        <Button
          className="h-8 rounded-full px-3 text-xs normal-case tracking-normal"
          size="sm"
          variant="ghost"
        >
          View all
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Button>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-4">
        {franchises.map((franchise) => (
          <article
            className="group flex min-w-[280px] items-center gap-4 pr-2"
            key={franchise.title}
          >
            <div className="relative h-36 w-24 shrink-0 [perspective:600px]">
              <div className="absolute bottom-1 left-3 h-[132px] w-16 rotate-[-7deg] rounded-r-md border border-white/10 bg-zinc-800 shadow-xl" />
              <div className="absolute bottom-1 right-1 h-[132px] w-16 rotate-[5deg] overflow-hidden rounded-r-md border border-white/10 bg-zinc-700 shadow-xl">
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="64px"
                  src={franchise.image}
                />
              </div>
              <div
                className="absolute bottom-0 left-0 h-36 w-20 overflow-hidden rounded-r-md rounded-l-sm shadow-[10px_12px_24px_-12px_rgba(0,0,0,0.75)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-[-2deg]"
                style={{ backgroundColor: franchise.accent }}
              >
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="80px"
                  src={franchise.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/10" />
                <div className="absolute inset-x-0 bottom-0 p-2.5">
                  <p className="text-[10px] font-bold uppercase leading-tight text-white">
                    {franchise.title}
                  </p>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-semibold">{franchise.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{franchise.type}</p>
              <div className="mt-3 flex items-center gap-2 text-xs font-medium">
                <BookOpen aria-hidden="true" className="size-4 text-amber-600" />
                <span>{franchise.count} in watch order</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
