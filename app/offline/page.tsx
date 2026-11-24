import type { Metadata } from "next"

import { OfflineScreen } from "@/components/offline-screen"

export const metadata: Metadata = {
  title: "Offline · Block Busters",
  robots: { index: false },
}

export default function OfflinePage() {
  return (
    <main>
      <OfflineScreen />
    </main>
  )
}
