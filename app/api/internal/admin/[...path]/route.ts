import { randomUUID } from "node:crypto"
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  ilike,
  inArray,
  lt,
  or,
  sql,
  type SQL,
} from "drizzle-orm"
import { NextResponse } from "next/server"

import { verifyAdminIdentity } from "@/lib/admin-identity"
import { getDb } from "@/lib/db"
import { adminApiRateLimits, titles, videos } from "@/lib/db/schema"
import { revalidateTitleTags } from "@/lib/revalidate"
import { slugify } from "@/lib/slugify"
import {
  abortSourceMultipartUpload,
  completeSourceMultipartUpload,
  createSourceMultipartUpload,
  deleteStorageObjects,
  getSourceObjectSize,
  listPublicKeys,
  mediaUrl,
  presignSourcePart,
  presignSourceUpload,
  presignUpload,
} from "@/lib/storage"

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const partSize = 25 * 1024 * 1024
const singleUploadLimit = 100 * 1024 * 1024
const maxUploadSize = 250_000_000_000
const maxConcurrentUploads = 3
const videoTypes = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/x-matroska": "mkv",
  "video/webm": "webm",
} as const
const imageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const

type Permission =
  | "blockbusters.view"
  | "blockbusters.write"
  | "blockbusters.publish"
  | "blockbusters.delete"
type Method = "GET" | "POST" | "PATCH" | "DELETE"
type RouteRule = { permission: Permission; write: boolean }
type RouteIdentity = { subject: string; requestId: string | null; reason: string | null }
type TitleInput = {
  title: string
  slug: string
  year: number
  rating?: number | null
  genre: string
  type: "movie" | "series"
  durationMin?: number | null
  description?: string | null
  posterKey?: string | null
  backdropKey?: string | null
  accent?: string | null
  sortOrder?: number
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isUniqueViolation(error: unknown) {
  return isRecord(error) && error.code === "23505"
}

function hasKey<T extends object>(values: T, key: string): key is Extract<keyof T, string> {
  return Object.prototype.hasOwnProperty.call(values, key)
}

function isStorageObjectMissing(error: unknown) {
  if (!isRecord(error)) return false
  const metadata = isRecord(error.$metadata) ? error.$metadata : null
  return (
    error.name === "NoSuchUpload" ||
    error.name === "NotFound" ||
    error.name === "NoSuchKey" ||
    metadata?.httpStatusCode === 404
  )
}

async function readJson(request: Request) {
  try {
    return await request.json() as unknown
  } catch {
    return null
  }
}

function routeRule(method: Method, path: string[]): RouteRule | null {
  const subpath = path.join("/")
  if (
    (path[0] === "titles" && path.length > 1 && !uuidPattern.test(path[1])) ||
    (path[0] === "videos" && path.length > 1 && !uuidPattern.test(path[1]))
  ) return null
  if (
    method === "GET" &&
    (subpath === "stats" || subpath === "titles" || subpath === "queue")
  ) return { permission: "blockbusters.view", write: false }
  if (method === "GET" && /^titles\/[0-9a-f-]{36}$/i.test(subpath)) {
    return { permission: "blockbusters.view", write: false }
  }
  if (method === "GET" && /^videos\/[0-9a-f-]{36}$/i.test(subpath)) {
    return { permission: "blockbusters.view", write: false }
  }
  if (
    method === "POST" &&
    (subpath === "titles" ||
      subpath === "uploads/init" ||
      subpath === "uploads/complete" ||
      subpath === "uploads/abort" ||
      subpath === "images/presign" ||
      /^videos\/[0-9a-f-]{36}\/retry$/i.test(subpath))
  ) return { permission: "blockbusters.write", write: true }
  if (
    method === "POST" &&
    /^titles\/[0-9a-f-]{36}\/(publish|unpublish)$/i.test(subpath)
  ) return { permission: "blockbusters.publish", write: true }
  if (method === "PATCH" && /^titles\/[0-9a-f-]{36}$/i.test(subpath)) {
    return { permission: "blockbusters.write", write: true }
  }
  if (method === "DELETE" && /^titles\/[0-9a-f-]{36}$/i.test(subpath)) {
    return { permission: "blockbusters.delete", write: true }
  }
  return null
}

async function limitRequests(subject: string, write: boolean) {
  const db = getDb()
  const now = new Date()
  const windowStart = new Date(Math.floor(now.getTime() / 60_000) * 60_000)
  const limit = write ? 30 : 120
  const [entry] = await db
    .insert(adminApiRateLimits)
    .values({ adminSubject: subject, windowStart, requestCount: 1 })
    .onConflictDoUpdate({
      target: [adminApiRateLimits.adminSubject, adminApiRateLimits.windowStart],
      set: { requestCount: sql`${adminApiRateLimits.requestCount} + 1` },
      setWhere: lt(adminApiRateLimits.requestCount, limit),
    })
    .returning({ requestCount: adminApiRateLimits.requestCount })
  await db.delete(adminApiRateLimits)
    .where(lt(adminApiRateLimits.windowStart, new Date(now.getTime() - 3_600_000)))
  return Boolean(entry)
}

function parseTitleFields(value: Record<string, unknown>, creating: boolean, titleId?: string) {
  const fields: Record<string, unknown> = {}
  const allowed = new Set([
    "title", "slug", "year", "rating", "genre", "type", "durationMin",
    "description", "posterKey", "backdropKey", "accent", "sortOrder",
  ])
  for (const key of Object.keys(value)) {
    if (key !== "reason" && !allowed.has(key)) return { error: `Unsupported title field: ${key}.` }
  }
  if (creating || "title" in value) {
    if (typeof value.title !== "string" || !value.title.trim() || value.title.trim().length > 200) {
      return { error: "Title must be between 1 and 200 characters." }
    }
    fields.title = value.title.trim()
    if ("slug" in value && typeof value.slug !== "string") {
      return { error: "Slug must be a string." }
    }
    const slug = typeof value.slug === "string" ? slugify(value.slug) : slugify(value.title)
    if (!slug || slug.length > 200) return { error: "A valid slug is required." }
    fields.slug = slug
  } else if ("slug" in value) {
    if (typeof value.slug !== "string" || !slugify(value.slug) || value.slug.length > 200) {
      return { error: "A valid slug is required." }
    }
    fields.slug = slugify(value.slug)
  }
  if (creating || "year" in value) {
    if (!Number.isInteger(value.year) || Number(value.year) < 1880 || Number(value.year) > 2200) {
      return { error: "Year must be a whole number between 1880 and 2200." }
    }
    fields.year = value.year
  }
  if (creating || "genre" in value) {
    if (typeof value.genre !== "string" || !value.genre.trim() || value.genre.trim().length > 80) {
      return { error: "Genre must be between 1 and 80 characters." }
    }
    fields.genre = value.genre.trim()
  }
  if (creating || "type" in value) {
    if (value.type !== "movie" && value.type !== "series") {
      return { error: "Type must be movie or series." }
    }
    fields.type = value.type
  }
  if ("rating" in value) {
    if (value.rating !== null && (typeof value.rating !== "number" || !Number.isFinite(value.rating) || value.rating < 0 || value.rating > 10)) {
      return { error: "Rating must be between 0 and 10." }
    }
    fields.rating = value.rating
  }
  if ("durationMin" in value) {
    if (value.durationMin !== null && (!Number.isInteger(value.durationMin) || Number(value.durationMin) < 1 || Number(value.durationMin) > 10000)) {
      return { error: "Duration must be a positive whole number of minutes." }
    }
    fields.durationMin = value.durationMin
  }
  if ("description" in value) {
    if (value.description !== null && (typeof value.description !== "string" || value.description.length > 10000)) {
      return { error: "Description must be at most 10,000 characters." }
    }
    fields.description = value.description
  }
  for (const key of ["posterKey", "backdropKey"] as const) {
    if (!(key in value)) continue
    const prefix = key === "posterKey" ? "posters/" : "backdrops/"
    const imageKey = value[key]
    const extension = typeof imageKey === "string" ? imageKey.slice(imageKey.lastIndexOf(".") + 1) : ""
    if (
      imageKey !== null &&
      (!titleId ||
        typeof imageKey !== "string" ||
        imageKey !== `${prefix}${titleId}.${extension}` ||
        !["jpg", "png", "webp"].includes(extension))
    ) {
      return { error: `${key} must be a key issued by the image upload endpoint.` }
    }
    fields[key] = value[key]
  }
  if ("accent" in value) {
    if (value.accent !== null && (typeof value.accent !== "string" || !/^#[0-9a-f]{6}$/i.test(value.accent))) {
      return { error: "Accent must be a six-digit hex color." }
    }
    fields.accent = value.accent
  }
  if ("sortOrder" in value) {
    if (!Number.isInteger(value.sortOrder)) return { error: "Sort order must be a whole number." }
    fields.sortOrder = value.sortOrder
  }
  return { fields }
}

function titlePublicData(row: typeof titles.$inferSelect) {
  return {
    ...row,
    posterUrl: row.posterKey ? mediaUrl(row.posterKey) : row.posterUrl,
    backdropUrl: row.backdropKey ? mediaUrl(row.backdropKey) : null,
  }
}

async function listTitles(request: Request) {
  const url = new URL(request.url)
  const q = url.searchParams.get("q")?.trim()
  const genre = url.searchParams.get("genre")?.trim()
  const type = url.searchParams.get("type")
  const published = url.searchParams.get("published")
  const sort = url.searchParams.get("sort") ?? "created"
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 25))
  const cursor = url.searchParams.get("cursor")
  if (type && type !== "movie" && type !== "series") return json({ message: "Invalid type filter." }, 400)
  if (published && published !== "true" && published !== "false") return json({ message: "Invalid published filter." }, 400)
  if (!["created", "updated", "title", "year"].includes(sort)) return json({ message: "Invalid sort order." }, 400)

  const filters: SQL[] = []
  if (q) filters.push(ilike(titles.title, `%${q}%`))
  if (genre) filters.push(ilike(titles.genre, genre))
  if (type) filters.push(eq(titles.type, type as "movie" | "series"))
  if (published) filters.push(eq(titles.published, published === "true"))
  if (cursor) {
    if (!uuidPattern.test(cursor)) return json({ message: "Invalid cursor." }, 400)
    const [cursorTitle] = await getDb()
      .select({ id: titles.id, createdAt: titles.createdAt, updatedAt: titles.updatedAt, title: titles.title, year: titles.year })
      .from(titles)
      .where(eq(titles.id, cursor))
      .limit(1)
    if (!cursorTitle) return json({ message: "Cursor title was not found." }, 400)
    if (sort === "title") {
      filters.push(or(gt(titles.title, cursorTitle.title), and(eq(titles.title, cursorTitle.title), gt(titles.id, cursorTitle.id)))!)
    } else if (sort === "year") {
      filters.push(or(lt(titles.year, cursorTitle.year), and(eq(titles.year, cursorTitle.year), lt(titles.id, cursorTitle.id)))!)
    } else {
      const current = sort === "updated" ? cursorTitle.updatedAt : cursorTitle.createdAt
      const column = sort === "updated" ? titles.updatedAt : titles.createdAt
      filters.push(or(lt(column, current), and(eq(column, current), lt(titles.id, cursorTitle.id)))!)
    }
  }
  const db = getDb()
  const orderBy =
    sort === "title" ? [asc(titles.title), asc(titles.id)] :
    sort === "year" ? [desc(titles.year), desc(titles.id)] :
    sort === "updated" ? [desc(titles.updatedAt), desc(titles.id)] :
    [desc(titles.createdAt), desc(titles.id)]
  const rows = await db
    .select()
    .from(titles)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(...orderBy)
    .limit(limit + 1)
  const hasMore = rows.length > limit
  const data = rows.slice(0, limit).map(titlePublicData)
  return json({ data, nextCursor: hasMore ? rows[limit].id : null })
}

async function getTitle(id: string) {
  const [row] = await getDb().select().from(titles).where(eq(titles.id, id)).limit(1)
  if (!row) return json({ message: "Title not found." }, 404)
  const [video] = await getDb()
    .select({
      id: videos.id,
      status: videos.status,
      attempts: videos.attempts,
      durationSec: videos.durationSec,
      errorMessage: videos.errorMessage,
      createdAt: videos.createdAt,
    })
    .from(videos)
    .where(eq(videos.titleId, id))
    .orderBy(desc(videos.createdAt))
    .limit(1)
  return json({ data: { ...titlePublicData(row), latestVideo: video ?? null } })
}

async function getStats() {
  const db = getDb()
  const [titleCounts, videoCounts, recentUploads, failedJobs] = await Promise.all([
    db.select({ published: titles.published, total: count() }).from(titles).groupBy(titles.published),
    db.select({ status: videos.status, total: count() }).from(videos).groupBy(videos.status),
    db.select({
      id: videos.id,
      titleId: videos.titleId,
      title: titles.title,
      status: videos.status,
      createdAt: videos.createdAt,
    }).from(videos).innerJoin(titles, eq(videos.titleId, titles.id))
      .orderBy(desc(videos.createdAt)).limit(10),
    db.select({
      id: videos.id,
      titleId: videos.titleId,
      title: titles.title,
      attempts: videos.attempts,
      errorMessage: videos.errorMessage,
      createdAt: videos.createdAt,
    }).from(videos).innerJoin(titles, eq(videos.titleId, titles.id))
      .where(eq(videos.status, "failed")).orderBy(desc(videos.createdAt)).limit(10),
  ])
  return json({
    data: {
      titles: {
        total: titleCounts.reduce((sum, item) => sum + Number(item.total), 0),
        published: Number(titleCounts.find((item) => item.published)?.total ?? 0),
        drafts: Number(titleCounts.find((item) => !item.published)?.total ?? 0),
      },
      videos: Object.fromEntries(videoCounts.map((item) => [item.status, Number(item.total)])),
      recentUploads,
      failedJobs,
    },
  })
}

async function getQueue() {
  const rows = await getDb().select({
    id: videos.id,
    titleId: videos.titleId,
    title: titles.title,
    status: videos.status,
    attempts: videos.attempts,
    errorMessage: videos.errorMessage,
    durationSec: videos.durationSec,
    createdAt: videos.createdAt,
    lockedAt: videos.lockedAt,
  }).from(videos).innerJoin(titles, eq(videos.titleId, titles.id))
    .where(inArray(videos.status, ["uploading", "uploaded", "processing", "failed"]))
    .orderBy(asc(videos.createdAt)).limit(200)
  return json({ data: rows })
}

async function createTitle(body: unknown, identity: RouteIdentity) {
  if (!isRecord(body)) return json({ message: "Invalid request body." }, 400)
  const db = getDb()
  const [existingRequest] = await db.select().from(titles)
    .where(eq(titles.adminRequestId, identity.requestId!)).limit(1)
  if (existingRequest) {
    return json({ data: titlePublicData(existingRequest), before: null, idempotent: true })
  }
  const id = randomUUID()
  const parsed = parseTitleFields(body, true, id)
  if ("error" in parsed) return json({ message: parsed.error }, 422)
  const [existingSlug] = await db.select({ id: titles.id }).from(titles)
    .where(eq(titles.slug, String(parsed.fields.slug))).limit(1)
  if (existingSlug) return json({ message: "A title with this slug already exists." }, 409)
  try {
    const [created] = await db.insert(titles).values({
      id,
      ...parsed.fields as TitleInput,
      adminRequestId: identity.requestId,
      published: false,
    }).returning()
    const revalidated = revalidateTitleTags([created.slug])
    return json({ data: titlePublicData(created), before: null, revalidated }, 201)
  } catch (error) {
    if (isUniqueViolation(error)) {
      const [retried] = await db.select().from(titles)
        .where(eq(titles.adminRequestId, identity.requestId!)).limit(1)
      if (retried) return json({ data: titlePublicData(retried), before: null, idempotent: true })
      return json({ message: "A title with this slug already exists." }, 409)
    }
    throw error
  }
}

async function updateTitle(id: string, body: unknown) {
  if (!isRecord(body)) return json({ message: "Invalid request body." }, 400)
  const db = getDb()
  const [before] = await db.select().from(titles).where(eq(titles.id, id)).limit(1)
  if (!before) return json({ message: "Title not found." }, 404)
  const parsed = parseTitleFields(body, false, id)
  if ("error" in parsed) return json({ message: parsed.error }, 422)
  if (!Object.keys(parsed.fields).length) return json({ message: "No editable title fields were provided." }, 422)
  if (parsed.fields.slug && parsed.fields.slug !== before.slug) {
    const [duplicate] = await db.select({ id: titles.id }).from(titles)
      .where(eq(titles.slug, String(parsed.fields.slug))).limit(1)
    if (duplicate) return json({ message: "A title with this slug already exists." }, 409)
  }
  const [after] = await db.update(titles)
    .set({ ...parsed.fields, updatedAt: new Date() })
    .where(eq(titles.id, id))
    .returning()
  const revalidated = revalidateTitleTags([before.slug, after.slug])
  return json({ data: titlePublicData(after), before, revalidated })
}

async function setPublished(id: string, published: boolean) {
  const db = getDb()
  const [before] = await db.select().from(titles).where(eq(titles.id, id)).limit(1)
  if (!before) return json({ message: "Title not found." }, 404)
  if (published) {
    const [ready] = await db.select({ id: videos.id }).from(videos)
      .where(and(eq(videos.titleId, id), eq(videos.status, "ready"))).limit(1)
    if (!ready) return json({ message: "A title needs a ready video before it can be published." }, 409)
  }
  const [after] = await db.update(titles).set({ published, updatedAt: new Date() })
    .where(eq(titles.id, id)).returning()
  const revalidated = revalidateTitleTags([before.slug, after.slug])
  return json({ data: titlePublicData(after), before, revalidated })
}

async function deleteTitle(id: string, body: unknown) {
  if (!isRecord(body) || typeof body.confirmation !== "string") {
    return json({ message: "Type the title name to confirm deletion." }, 422)
  }
  const db = getDb()
  const [before] = await db.select().from(titles).where(eq(titles.id, id)).limit(1)
  if (!before) return json({ message: "Title not found." }, 404)
  if (body.confirmation.trim() !== before.title) {
    return json({ message: "The confirmation does not match the title name." }, 422)
  }
  const attachedVideos = await db.select({ id: videos.id, sourceKey: videos.sourceKey, hlsKey: videos.hlsKey })
    .from(videos).where(eq(videos.titleId, id))
  const publicKeys: string[] = []
  let listingFailed = false
  for (const video of attachedVideos) {
    try {
      publicKeys.push(...await listPublicKeys(`videos/${video.id}/`))
    } catch (error) {
      listingFailed = true
      console.error("Could not list Block Busters video objects for deletion:", error)
    }
    publicKeys.push(...attachedVideos.flatMap((video) =>
      video.hlsKey?.startsWith(`videos/${video.id}/`) ? [video.hlsKey] : [],
    ))
  }
  publicKeys.push(...[before.posterKey, before.backdropKey].filter((key): key is string => Boolean(key)))
  await db.transaction(async (tx) => {
    await tx.delete(titles).where(eq(titles.id, id))
  })

  const orphanedKeys: string[] = listingFailed
    ? attachedVideos.map((video) => `videos/${video.id}/`)
    : []
  const privateKeys = attachedVideos.map((video) => video.sourceKey)
  try {
    orphanedKeys.push(...await deleteStorageObjects("B2_PRIVATE_BUCKET", privateKeys))
  } catch (error) {
    console.error("Could not delete private Block Busters video objects:", error)
    orphanedKeys.push(...privateKeys)
  }
  const uniquePublicKeys = [...new Set(publicKeys)]
  try {
    orphanedKeys.push(...await deleteStorageObjects("B2_PUBLIC_BUCKET", uniquePublicKeys))
  } catch (error) {
    console.error("Could not delete public Block Busters video objects:", error)
    orphanedKeys.push(...uniquePublicKeys)
  }
  const revalidated = revalidateTitleTags([before.slug])
  return json({
    data: { id, deleted: true, orphanedKeys: [...new Set(orphanedKeys)] },
    before: titlePublicData(before),
    revalidated,
  })
}

async function initializeUpload(body: unknown, identity: RouteIdentity) {
  if (!isRecord(body)) return json({ message: "Invalid request body." }, 400)
  const { titleId, filename, size, contentType } = body
  if (
    typeof titleId !== "string" || !uuidPattern.test(titleId) ||
    typeof filename !== "string" || filename.length > 255 ||
    typeof size !== "number" || !Number.isSafeInteger(size) || size < 1 || size > maxUploadSize ||
    typeof contentType !== "string" || !hasKey(videoTypes, contentType)
  ) return json({ message: "Valid titleId, filename, size and supported contentType are required." }, 422)

  const db = getDb()
  const [existingRequest] = await db.select().from(videos)
    .where(eq(videos.adminRequestId, identity.requestId!)).limit(1)
  if (existingRequest) {
    return await existingUploadPlan(existingRequest)
  }
  const [title] = await db.select({ id: titles.id }).from(titles).where(eq(titles.id, titleId)).limit(1)
  if (!title) return json({ message: "Title not found." }, 404)
  const [active] = await db.select({ total: count() }).from(videos)
    .where(and(eq(videos.adminSubject, identity.subject), eq(videos.status, "uploading")))
  if (Number(active?.total ?? 0) >= maxConcurrentUploads) {
    return json({ message: "You already have the maximum number of active uploads." }, 429)
  }
  const extension = videoTypes[contentType as keyof typeof videoTypes]
  const videoId = randomUUID()
  const key = `sources/${videoId}.${extension}`
  const multipart = size >= singleUploadLimit
  let uploadId: string | null = null
  try {
    if (multipart) uploadId = await createSourceMultipartUpload(key, contentType)
    await db.insert(videos).values({
      id: videoId,
      titleId,
      sourceKey: key,
      status: "uploading",
      uploadId,
      adminRequestId: identity.requestId,
      adminSubject: identity.subject,
      sourceSize: size,
      contentType,
    })
  } catch (error) {
    if (uploadId) {
      try {
        await abortSourceMultipartUpload(key, uploadId)
      } catch (abortError) {
        console.error("Could not abort duplicate Block Busters multipart upload:", abortError)
      }
    }
    if (isUniqueViolation(error)) {
      const [retried] = await db.select().from(videos)
        .where(eq(videos.adminRequestId, identity.requestId!)).limit(1)
      if (retried) return await existingUploadPlan(retried)
    }
    throw error
  }
  const plan = multipart
    ? {
        videoId,
        uploadId,
        partSize,
        parts: await Promise.all(Array.from({ length: Math.ceil(size / partSize) }, async (_, index) => ({
          PartNumber: index + 1,
          url: await presignSourcePart(key, uploadId!, index + 1),
        }))),
      }
    : { videoId, uploadId: null, uploadUrl: await presignSourceUpload(key, contentType) }
  return json({ data: plan, before: null }, 201)
}

async function existingUploadPlan(video: typeof videos.$inferSelect) {
  if (video.status !== "uploading") {
    return json({
      data: { videoId: video.id, status: video.status },
      before: null,
      idempotent: true,
    })
  }
  const contentType = video.contentType
  const extension = contentType && videoTypes[contentType as keyof typeof videoTypes]
  if (!extension || !contentType || !video.sourceSize) {
    return json({ message: "The existing upload cannot be resumed." }, 409)
  }
  const key = `sources/${video.id}.${extension}`
  if (video.uploadId) {
    const count = Math.ceil(video.sourceSize / partSize)
    const parts = await Promise.all(Array.from({ length: count }, async (_, index) => ({
      PartNumber: index + 1,
      url: await presignSourcePart(key, video.uploadId!, index + 1),
    })))
    return json({ data: { videoId: video.id, uploadId: video.uploadId, partSize, parts }, before: null, idempotent: true })
  }
  return json({ data: { videoId: video.id, uploadId: null, uploadUrl: await presignSourceUpload(key, contentType) }, before: null, idempotent: true })
}

async function completeUpload(body: unknown, identity: RouteIdentity) {
  if (!isRecord(body) || typeof body.videoId !== "string" || !uuidPattern.test(body.videoId)) {
    return json({ message: "A valid videoId is required." }, 422)
  }
  const [video] = await getDb().select().from(videos).where(eq(videos.id, body.videoId)).limit(1)
  if (!video) return json({ message: "Video not found." }, 404)
  if (video.adminSubject !== identity.subject) return json({ message: "Only the uploader can complete this upload." }, 403)
  if (video.status !== "uploading") {
    return json({ data: { id: video.id, status: video.status }, before: { status: video.status }, idempotent: true })
  }
  if (video.uploadId) {
    if (body.uploadId !== video.uploadId || !Array.isArray(body.parts)) {
      return json({ message: "Multipart upload ID and parts are required." }, 422)
    }
    const expectedCount = Math.ceil((video.sourceSize ?? 0) / partSize)
    const suppliedParts = body.parts as unknown[]
    if (suppliedParts.length !== expectedCount) return json({ message: "All multipart upload parts are required." }, 422)
    const parts: Array<{ PartNumber: number; ETag: string }> = []
    for (const part of suppliedParts) {
      if (!isRecord(part) || !Number.isInteger(part.PartNumber) || typeof part.ETag !== "string" || !/^"?[A-Za-z0-9+/=:-]{1,256}"?$/.test(part.ETag)) {
        return json({ message: "Multipart upload part data is invalid." }, 422)
      }
      parts.push({ PartNumber: Number(part.PartNumber), ETag: part.ETag })
    }
    parts.sort((left, right) => left.PartNumber - right.PartNumber)
    if (parts.some((part, index) => part.PartNumber !== index + 1)) {
      return json({ message: "Multipart part numbers must be continuous from 1." }, 422)
    }
    try {
      await completeSourceMultipartUpload(video.sourceKey, video.uploadId, parts)
    } catch (error) {
      if (!isStorageObjectMissing(error)) throw error
      const completedSize = await getSourceObjectSize(video.sourceKey).catch((headError: unknown) => {
        if (isStorageObjectMissing(headError)) return undefined
        throw headError
      })
      if (completedSize !== video.sourceSize) throw error
    }
  } else if (body.uploadId !== undefined && body.uploadId !== null) {
    return json({ message: "This video does not have a multipart upload." }, 422)
  }
  const actualSize = await getSourceObjectSize(video.sourceKey).catch((error: unknown) => {
    if (isStorageObjectMissing(error)) return undefined
    throw error
  })
  if (actualSize === undefined) {
    return json({ message: "The uploaded source file was not found in storage." }, 409)
  }
  if (actualSize !== video.sourceSize) {
    return json({ message: "Uploaded file size does not match the initialized upload." }, 409)
  }
  const [after] = await getDb().update(videos)
    .set({ status: "uploaded", uploadId: null, errorMessage: null, lockedAt: null })
    .where(eq(videos.id, video.id)).returning()
  return json({
    data: { id: after.id, status: after.status, titleId: after.titleId },
    before: { status: video.status },
  })
}

async function abortUpload(body: unknown, identity: RouteIdentity) {
  if (!isRecord(body) || typeof body.videoId !== "string" || !uuidPattern.test(body.videoId)) {
    return json({ message: "A valid videoId is required." }, 422)
  }
  const db = getDb()
  const [video] = await db.select().from(videos).where(eq(videos.id, body.videoId)).limit(1)
  if (!video) return json({ message: "Video not found." }, 404)
  if (video.adminSubject !== identity.subject) return json({ message: "Only the uploader can abort this upload." }, 403)
  if (video.status !== "uploading") return json({ message: "Only an active upload can be aborted." }, 409)
  if (video.uploadId) await abortSourceMultipartUpload(video.sourceKey, video.uploadId)
  await deleteStorageObjects("B2_PRIVATE_BUCKET", [video.sourceKey])
  await db.delete(videos).where(eq(videos.id, video.id))
  return json({ data: { id: video.id, aborted: true }, before: { status: video.status } })
}

async function presignImage(body: unknown) {
  if (!isRecord(body)) return json({ message: "Invalid request body." }, 400)
  const { titleId, kind, contentType, size } = body
  if (
    typeof titleId !== "string" || !uuidPattern.test(titleId) ||
    (kind !== "poster" && kind !== "backdrop") ||
    typeof contentType !== "string" || !hasKey(imageTypes, contentType) ||
    typeof size !== "number" || !Number.isSafeInteger(size) || size < 1 || size > 5 * 1024 * 1024
  ) return json({ message: "A title, poster/backdrop kind, supported image type and size up to 5 MB are required." }, 422)
  const [title] = await getDb().select({ id: titles.id }).from(titles).where(eq(titles.id, titleId)).limit(1)
  if (!title) return json({ message: "Title not found." }, 404)
  const prefix = kind === "poster" ? "posters" : "backdrops"
  const key = `${prefix}/${titleId}.${imageTypes[contentType as keyof typeof imageTypes]}`
  return json({ data: { uploadUrl: await presignUpload(key, contentType), key, publicUrl: mediaUrl(key) } })
}

async function getVideo(id: string) {
  const [video] = await getDb().select({
    id: videos.id,
    titleId: videos.titleId,
    status: videos.status,
    attempts: videos.attempts,
    errorMessage: videos.errorMessage,
    durationSec: videos.durationSec,
    createdAt: videos.createdAt,
    lockedAt: videos.lockedAt,
  }).from(videos).where(eq(videos.id, id)).limit(1)
  return video ? json({ data: video }) : json({ message: "Video not found." }, 404)
}

async function retryVideo(id: string) {
  const db = getDb()
  const [before] = await db.select().from(videos).where(eq(videos.id, id)).limit(1)
  if (!before) return json({ message: "Video not found." }, 404)
  if (before.status !== "failed") return json({ message: "Only failed videos can be retried." }, 409)
  const [after] = await db.update(videos)
    .set({ status: "uploaded", attempts: 0, errorMessage: null, lockedAt: null })
    .where(eq(videos.id, id)).returning()
  return json({ data: { id: after.id, status: after.status }, before: { status: before.status, attempts: before.attempts } })
}

async function handle(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const method = request.method as Method
  const { path } = await context.params
  const rule = routeRule(method, path)
  if (!rule) return json({ message: "Not found." }, 404)

  let verified
  try {
    verified = await verifyAdminIdentity(request, rule.permission, rule.write)
  } catch (error) {
    console.error("Block Busters admin identity verification is unavailable:", error)
    return json({ message: "Admin identity verification is unavailable." }, 503)
  }
  if ("error" in verified) return json({ message: verified.error }, verified.status)
  const identity = verified.identity as RouteIdentity

  try {
    if (!(await limitRequests(identity.subject, rule.write))) {
      return json({ message: "Too many admin requests. Try again shortly." }, 429)
    }
    const subpath = path.join("/")
    if (method === "GET") {
      if (subpath === "stats") return await getStats()
      if (subpath === "titles") return await listTitles(request)
      if (subpath === "queue") return await getQueue()
      const [, id] = path
      if (path[0] === "titles") return await getTitle(id)
      return await getVideo(id)
    }
    const body = await readJson(request)
    if (body === null) return json({ message: "Invalid JSON body." }, 400)
    if (method === "POST" && subpath === "titles") return await createTitle(body, identity)
    if (method === "POST" && subpath === "uploads/init") return await initializeUpload(body, identity)
    if (method === "POST" && subpath === "uploads/complete") return await completeUpload(body, identity)
    if (method === "POST" && subpath === "uploads/abort") return await abortUpload(body, identity)
    if (method === "POST" && subpath === "images/presign") return await presignImage(body)
    if (method === "POST" && /^titles\/[0-9a-f-]{36}\/(publish|unpublish)$/i.test(subpath)) {
      const id = path[1]
      return await setPublished(id, path[2] === "publish")
    }
    if (method === "POST" && /^videos\/[0-9a-f-]{36}\/retry$/i.test(subpath)) {
      return await retryVideo(path[1])
    }
    if (method === "PATCH") return await updateTitle(path[1], body)
    if (method === "DELETE") return await deleteTitle(path[1], body)
    return json({ message: "Not found." }, 404)
  } catch (error) {
    console.error("Block Busters internal admin request failed:", error)
    return json({ message: "Block Busters admin service could not complete the request." }, 500)
  }
}

export const GET = handle
export const POST = handle
export const PATCH = handle
export const DELETE = handle
