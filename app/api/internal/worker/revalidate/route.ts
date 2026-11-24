import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"

import { revalidateTitleTags } from "@/lib/revalidate"

function isAuthorized(request: Request) {
  const expected = process.env.WORKER_SECRET
  const authorization = request.headers.get("authorization") ?? ""
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : ""
  if (!expected || expected.length < 32 || !supplied) return false
  const expectedBytes = Buffer.from(expected)
  const suppliedBytes = Buffer.from(supplied)
  return expectedBytes.length === suppliedBytes.length && timingSafeEqual(expectedBytes, suppliedBytes)
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401, headers: { "Cache-Control": "no-store" } })
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400, headers: { "Cache-Control": "no-store" } })
  }
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    !("slug" in body) ||
    typeof body.slug !== "string" ||
    !body.slug.trim() ||
    body.slug.length > 200
  ) {
    return NextResponse.json({ message: "A valid title slug is required." }, { status: 422, headers: { "Cache-Control": "no-store" } })
  }
  const revalidated = revalidateTitleTags([body.slug])
  return NextResponse.json(
    { data: { revalidated } },
    { headers: { "Cache-Control": "no-store" } },
  )
}
