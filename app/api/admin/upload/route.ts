import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { spurs } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { titles, videos } from "@/lib/db/schema"
import { presignUpload } from "@/lib/storage"

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  const user = await spurs.getUser()
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  if (!user?.email || !admins.includes(user.email.trim().toLowerCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body || typeof body !== "object" || !("titleId" in body)) {
    return NextResponse.json({ error: "A titleId is required" }, { status: 400 })
  }

  const { titleId, contentType } = body as {
    titleId?: unknown
    contentType?: unknown
  }
  if (typeof titleId !== "string" || !uuidPattern.test(titleId)) {
    return NextResponse.json({ error: "A valid titleId is required" }, { status: 400 })
  }
  if (contentType !== undefined && contentType !== "video/mp4") {
    return NextResponse.json(
      { error: "Only video/mp4 uploads are supported" },
      { status: 415 }
    )
  }

  const db = getDb()
  const [title] = await db
    .select({ id: titles.id })
    .from(titles)
    .where(eq(titles.id, titleId))
    .limit(1)

  if (!title) {
    return NextResponse.json({ error: "Title not found" }, { status: 404 })
  }

  const videoId = randomUUID()
  const sourceKey = `sources/${videoId}.mp4`
  const uploadUrl = await presignUpload(sourceKey, "video/mp4")

  await db.insert(videos).values({ id: videoId, titleId, sourceKey })

  return NextResponse.json({ uploadUrl, videoId })
}
