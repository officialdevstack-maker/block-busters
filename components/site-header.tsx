import { Bookmark, Clapperboard } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { SpursAccountMenu } from '@spurs/auth/react'

import { Button } from '@/components/ui/button'
import { DiscoverSidebar } from '@/components/discover-sidebar'
import { HeaderNav } from '@/components/header-nav'
import { HeaderSearch } from '@/components/header-search'
import { MobileNav } from '@/components/mobile-nav'
import { spurs } from '@/lib/auth'

async function AccountMenu() {
  const user = await spurs.getUser()
  return (
    <SpursAccountMenu
      accent="#eab308"
      className="shrink-0"
      signOutUrl={spurs.signOutUrl()}
      style={{ borderRadius: '9999px', color: '#111827' }}
      theme="dark"
      user={user}
    >
      {user ? (
        <a
          href="/account"
          style={{
            color: '#f9fafb',
            display: 'block',
            fontSize: 14,
            padding: '12px 20px',
            textDecoration: 'none',
          }}
        >
          Block Busters account
        </a>
      ) : null}
    </SpursAccountMenu>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 text-foreground backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-center gap-x-2 px-3 sm:gap-x-3 sm:px-4 lg:flex-nowrap lg:gap-x-4">
        <div className="flex h-14 items-center gap-1 sm:gap-2">
          <MobileNav>
            <DiscoverSidebar />
          </MobileNav>
          <Link
            aria-label="Block Busters home"
            className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand"
            href="/"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-black">
              <Clapperboard aria-hidden="true" className="size-4.5" />
            </span>
            <span className="hidden font-heading text-lg font-semibold min-[420px]:inline">
              Block Busters
            </span>
          </Link>
        </div>

        <HeaderSearch />

        <Suspense fallback={<div className="order-last h-11 w-full lg:order-none lg:h-0 lg:flex-1" />}>
          <HeaderNav />
        </Suspense>

        <div className="flex h-14 items-center gap-1 sm:ml-auto lg:ml-0">
          <Button
            aria-label="My list"
            className="h-10 gap-2 rounded-full px-3 text-sm normal-case tracking-normal text-muted-foreground"
            nativeButton={false}
            render={<Link href="/watchlist" />}
            size="sm"
            variant="ghost"
          >
            <Bookmark aria-hidden="true" className="size-4" />
            <span className="hidden xl:inline">My list</span>
          </Button>
          <Suspense fallback={<div className="h-10 w-24 rounded-full bg-muted" />}>
            <AccountMenu />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
