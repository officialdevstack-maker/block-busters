import { Card } from '@/components/ui/card'
import {
  ChevronDown,
  Clock3,
  Heart,
  Home,
  LifeBuoy,
  Settings,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const quickLinks = [
  { label: 'Home', href: '/', icon: Home, current: true },
  { label: 'Favorites', href: '/?view=favorites', icon: Heart },
  { label: 'Coming Soon', href: '/?view=coming-soon', icon: Clock3 },
  { label: 'Trending', href: '/?view=trending', icon: TrendingUp },
]

const genres = [
  { name: 'Action', subgenres: ['Adventure', 'Martial Arts', 'Superhero'] },
  { name: 'Drama', subgenres: ['Crime', 'Romance', 'Period'] },
  { name: 'Sci-Fi', subgenres: ['Space', 'Dystopian', 'Time Travel'] },
  { name: 'Comedy', subgenres: ['Rom-com', 'Satire', 'Dark Comedy'] },
  { name: 'Horror', subgenres: ['Supernatural', 'Psychological', 'Slasher'] },
]

const footerLinks = [
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Support', href: '/support', icon: LifeBuoy },
]

export function DiscoverSidebar() {
  return (
    <aside className="md:sticky md:top-20 md:self-start">
      <Card className="flex h-full min-h-[calc(100vh-7rem)] flex-col gap-0 rounded-2xl p-4 md:h-[calc(100vh-6rem)] md:min-h-0 md:p-5">
        <nav aria-label="Quick links">
          <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Browse
          </h2>
          <ul className="space-y-1">
            {quickLinks.map(({ label, href, icon: Icon, current }) => (
              <li key={label}>
                <Button
                  aria-current={current ? 'page' : undefined}
                  className={`h-10 w-full justify-start gap-3 rounded-lg px-3 text-sm normal-case tracking-normal ${
                    current
                      ? 'bg-amber-400/15 font-medium text-amber-700 hover:bg-amber-400/20'
                      : 'text-muted-foreground'
                  }`}
                  nativeButton={false}
                  render={<Link href={href} />}
                  size="sm"
                  variant="ghost"
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <nav
          aria-label="Genres"
          className="mt-5 min-h-0 flex-1 overflow-y-auto border-t border-border pt-4"
        >
          <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Genres
          </h2>
          <ul className="space-y-1">
            {genres.map(({ name, subgenres }) => (
              <li key={name}>
                <details className="group/genre">
                  <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600">
                    {name}
                    <ChevronDown
                      aria-hidden="true"
                      className="size-4 text-muted-foreground transition-transform group-open/genre:rotate-180"
                    />
                  </summary>
                  <ul className="ml-3 space-y-0.5 border-l border-border py-1 pl-3">
                    {subgenres.map((subgenre) => (
                      <li key={subgenre}>
                        <Button
                          className="h-8 w-full justify-start rounded-md px-2 text-xs normal-case tracking-normal text-muted-foreground"
                          nativeButton={false}
                          render={
                            <Link
                              href={`/?genre=${name.toLowerCase()}&subgenre=${encodeURIComponent(subgenre.toLowerCase())}`}
                            />
                          }
                          size="xs"
                          variant="ghost"
                        >
                          {subgenre}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Settings and support" className="mt-4 border-t border-border pt-3">
          <ul className="space-y-1">
            {footerLinks.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <Button
                  className="h-10 w-full justify-start gap-3 rounded-lg px-3 text-sm normal-case tracking-normal text-muted-foreground"
                  nativeButton={false}
                  render={<Link href={href} />}
                  size="sm"
                  variant="ghost"
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </Card>
    </aside>
  )
}
