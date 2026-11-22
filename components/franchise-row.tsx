"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Franchise } from "@/data/franchises"

type FranchiseRowProps = {
  franchises: Franchise[]
}

function OrderedList({ franchise, chrono = false }: { franchise: Franchise; chrono?: boolean }) {
  const films = [...franchise.films].sort((a, b) =>
    chrono ? a.chronoOrder - b.chronoOrder : a.releaseOrder - b.releaseOrder
  )

  return (
    <ol className="mt-4 space-y-3">
      {films.map((film, index) => (
        <li className="flex items-center gap-4" key={film.id}>
          <span className="w-6 text-right text-2xl font-bold text-muted-foreground">
            {index + 1}
          </span>
          <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg">
            <Image alt={film.title} className="object-cover" fill sizes="64px" src={film.poster} />
          </div>
          <div>
            <p className="font-medium">{film.title}</p>
            <p className="text-sm text-muted-foreground">{film.year}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function FranchiseRow({ franchises }: FranchiseRowProps) {
  const [active, setActive] = React.useState<Franchise | null>(null)

  return (
    <>
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

        <div className="flex gap-10 overflow-x-auto px-1 py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {franchises.map((franchise) => {
            const pages = franchise.covers.slice(1, 4)

            return (
              <motion.button
                key={franchise.id}
                onClick={() => setActive(franchise)}
                initial="rest"
                animate="rest"
                whileHover="open"
                whileTap="open"
                className="relative isolate aspect-[2/3] w-44 shrink-0 text-left [perspective:1000px]"
                type="button"
              >
                {pages.map((src, index) => (
                  <motion.div
                    key={src}
                    variants={{
                      rest: { x: (index + 1) * 6 },
                      open: { x: (index + 1) * 16 },
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    style={{ zIndex: -(index + 1) }}
                    className="absolute inset-0 overflow-hidden rounded-l-sm rounded-r-xl bg-neutral-300 shadow-md"
                  >
                    <Image alt="" className="object-cover" fill sizes="176px" src={src} />
                    <div className="absolute inset-0 bg-black/45" />
                  </motion.div>
                ))}

                <motion.div
                  variants={{ rest: { rotateY: 0 }, open: { rotateY: -28 } }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
                  style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
                  className="absolute inset-0 overflow-hidden rounded-l-sm rounded-r-xl shadow-2xl"
                >
                  <Image
                    alt={franchise.title}
                    className="object-cover"
                    fill
                    sizes="176px"
                    src={franchise.covers[0]}
                  />
                  <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/70 to-transparent" />
                  <div className="absolute inset-y-0 left-4 w-px bg-white/25" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pl-6">
                    <Badge variant="secondary" className="mb-1 rounded-full text-[10px]">
                      Collection · {franchise.covers.length} films
                    </Badge>
                    <p className="text-sm font-semibold text-white">{franchise.title}</p>
                  </div>
                </motion.div>
              </motion.button>
            )
          })}
        </div>
      </section>

      {active && (
        <Sheet open onOpenChange={(open) => !open && setActive(null)}>
          <SheetContent className="overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle>{active.title}</SheetTitle>
            </SheetHeader>
            <Tabs defaultValue="release" className="mt-4 px-8">
              <TabsList>
                <TabsTrigger value="release">Release order</TabsTrigger>
                <TabsTrigger value="chrono">Story order</TabsTrigger>
              </TabsList>
              <TabsContent value="release">
                <OrderedList franchise={active} />
              </TabsContent>
              <TabsContent value="chrono">
                <OrderedList chrono franchise={active} />
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
