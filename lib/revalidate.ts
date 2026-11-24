import "server-only"

import { revalidateTag } from "next/cache"

export function revalidateTitleTags(slugs: Array<string | null | undefined>) {
  try {
    revalidateTag("titles", "max")
    for (const slug of new Set(slugs.filter((value): value is string => Boolean(value)))) {
      revalidateTag(`title:${slug}`, "max")
    }
    return true
  } catch (error) {
    console.error("Could not revalidate Block Busters title cache:", error)
    return false
  }
}
