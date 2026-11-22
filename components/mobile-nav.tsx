"use client"

import type { ReactNode } from "react"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function MobileNav({ children }: { children: ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            aria-label="Open menu"
            className="md:hidden"
            size="icon"
            type="button"
            variant="ghost"
          />
        }
      >
        <Menu aria-hidden="true" className="size-5" />
      </SheetTrigger>
      <SheetContent className="w-72 p-0" side="left">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  )
}
