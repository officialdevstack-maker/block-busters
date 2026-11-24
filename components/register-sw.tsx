"use client"

import * as React from "react"

export function RegisterSW() {
  React.useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((error: unknown) =>
          console.error("Service worker registration failed:", error)
        )
    }
  }, [])

  return null
}
