import "dotenv/config"

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { Pool } from "pg"
import { execFile as execFileCallback } from "node:child_process"
import { createReadStream, createWriteStream } from "node:fs"
import { mkdir, mkdtemp, readdir, rm, stat } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, relative, sep } from "node:path"
import { promisify } from "node:util"
import { Readable } from "node:stream"
import { pipeline } from "node:stream/promises"

const execFile = promisify(execFileCallback)
const pool = new Pool({ connectionString: requiredEnv("DATABASE_URL"), max: 2 })
const client = new S3Client({
  region: requiredEnv("B2_REGION"),
  endpoint: requiredEnv("B2_ENDPOINT"),
  credentials: {
    accessKeyId: requiredEnv("B2_KEY_ID"),
    secretAccessKey: requiredEnv("B2_APP_KEY"),
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
})
const privateBucket = requiredEnv("B2_PRIVATE_BUCKET")
const publicBucket = requiredEnv("B2_PUBLIC_BUCKET")
const appUrl = requiredEnv("BLOCKBUSTERS_URL").replace(/\/+$/, "")
const workerSecret = requiredEnv("WORKER_SECRET")
let stopping = false
let lastSweep = 0

function requiredEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} must be configured for the transcode worker.`)
  return value
}

type VideoJob = {
  id: string
  title_id: string
  slug: string
  source_key: string
  attempts: number
}

type Probe = {
  format?: { duration?: string }
  streams?: Array<{ codec_type?: string; width?: number; height?: number }>
}

async function claimJob() {
  const { rows } = await pool.query<VideoJob>(
    `UPDATE videos
     SET status = 'processing', locked_at = now(), attempts = attempts + 1
     WHERE id = (
       SELECT id FROM videos
       WHERE status = 'uploaded'
       ORDER BY created_at
       FOR UPDATE SKIP LOCKED
       LIMIT 1
     )
     RETURNING id, title_id, source_key, attempts`,
  )
  const job = rows[0]
  if (!job) return null
  const title = await pool.query<{ slug: string }>(
    `SELECT slug FROM titles WHERE id = $1`,
    [job.title_id],
  )
  if (!title.rows[0]) throw new Error(`Video ${job.id} refers to a missing title.`)
  return { ...job, slug: title.rows[0].slug }
}

async function sweepStuckJobs() {
  const { rows } = await pool.query<{ id: string; status: string }>(
    `UPDATE videos
     SET status = CASE WHEN attempts >= 3 THEN 'failed'::video_status ELSE 'uploaded'::video_status END,
         locked_at = NULL,
         error_message = 'Processing timed out and was recovered by the worker.'
     WHERE status = 'processing'
       AND locked_at < now() - interval '2 hours'
     RETURNING id, status`,
  )
  if (rows.length) console.warn(`Recovered ${rows.length} stuck transcode job(s).`)
}

async function probeSource(path: string) {
  const { stdout } = await execFile("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration:stream=codec_type,width,height",
    "-of", "json",
    path,
  ])
  return JSON.parse(stdout) as Probe
}

async function downloadSource(key: string, destination: string) {
  const response = await client.send(
    new GetObjectCommand({ Bucket: privateBucket, Key: key }),
  )
  if (!(response.Body instanceof Readable)) {
    throw new Error("B2 did not return a readable source stream.")
  }
  await pipeline(response.Body, createWriteStream(destination))
}

function buildFfmpegArgs(input: string, output: string, height: number, hasAudio: boolean) {
  const targetHeights = [1080, 720, 480].filter((target) => target <= height)
  if (!targetHeights.length) targetHeights.push(height)
  const split = `[0:v]split=${targetHeights.length}${targetHeights.map((_, index) => `[split${index}]`).join("")}`
  const filterComplex = targetHeights.length === 1
    ? `[0:v]scale=-2:${targetHeights[0]}[v0]`
    : `${split};${targetHeights.map((target, index) => `[split${index}]scale=-2:${target}[v${index}]`).join(";")}`

  const args = ["-hide_banner", "-loglevel", "error", "-y", "-i", input, "-filter_complex", filterComplex]
  const variants: string[] = []
  for (let index = 0; index < targetHeights.length; index += 1) {
    args.push("-map", `[v${index}]`)
    if (hasAudio) args.push("-map", "0:a:0")
    const bitrate = targetHeights[index] >= 1000 ? "5000k" : targetHeights[index] >= 700 ? "2800k" : "1200k"
    args.push(`-b:v:${index}`, bitrate)
    if (hasAudio) args.push(`-b:a:${index}`, "128k")
    variants.push(hasAudio ? `v:${index},a:${index}` : `v:${index}`)
  }
  args.push(
    "-c:v", "libx264",
    "-preset", "medium",
    "-profile:v", "main",
    "-c:a", "aac",
    "-ac", "2",
    "-g", "48",
    "-keyint_min", "48",
    "-sc_threshold", "0",
    "-f", "hls",
    "-hls_time", "6",
    "-hls_playlist_type", "vod",
    "-hls_segment_filename", join(output, "v%v", "seg_%03d.ts"),
    "-master_pl_name", "master.m3u8",
    "-var_stream_map", variants.join(" "),
    join(output, "v%v", "index.m3u8"),
  )
  return args
}

async function uploadHlsTree(directory: string, videoId: string) {
  const files: string[] = []
  async function visit(path: string) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const child = join(path, entry.name)
      if (entry.isDirectory()) await visit(child)
      else if (entry.isFile()) files.push(child)
    }
  }
  await visit(directory)
  for (const file of files) {
    const key = `videos/${videoId}/${relative(directory, file).split(sep).join("/")}`
    const isPlaylist = file.endsWith(".m3u8")
    const contentType = isPlaylist ? "application/vnd.apple.mpegurl" : "video/mp2t"
    const cacheControl = isPlaylist
      ? "public, max-age=60"
      : "public, max-age=31536000, immutable"
    await client.send(new PutObjectCommand({
      Bucket: publicBucket,
      Key: key,
      Body: createReadStream(file),
      ContentLength: (await stat(file)).size,
      ContentType: contentType,
      CacheControl: cacheControl,
    }))
  }
}

async function notifyRevalidation(slug: string) {
  const response = await fetch(`${appUrl}/api/internal/worker/revalidate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${workerSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ slug }),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error(`Block Busters cache revalidation failed with ${response.status}.`)
  }
}

async function processJob(job: VideoJob) {
  const directory = await mkdtemp(join(tmpdir(), `bb-${job.id}-`))
  const input = join(directory, "source")
  const output = join(directory, "out")
  try {
    await downloadSource(job.source_key, input)
    const probe = await probeSource(input)
    const video = probe.streams?.find((stream) => stream.codec_type === "video")
    const duration = Number(probe.format?.duration)
    if (!video?.height || !Number.isFinite(duration) || duration <= 0) {
      throw new Error("The source file has no valid video stream or duration.")
    }
    const hasAudio = probe.streams?.some((stream) => stream.codec_type === "audio") ?? false
    await mkdir(output, { recursive: true })
    const targetHeights = [1080, 720, 480].filter((target) => target <= video.height!)
    const heights = targetHeights.length ? targetHeights : [video.height]
    for (let index = 0; index < heights.length; index += 1) {
      await mkdir(join(output, `v${index}`), { recursive: true })
    }
    await execFile("ffmpeg", buildFfmpegArgs(input, output, video.height, hasAudio), {
      maxBuffer: 10 * 1024 * 1024,
    })
    await uploadHlsTree(output, job.id)
    await pool.query(
      `UPDATE videos
       SET status = 'ready', hls_key = $2, duration_sec = $3,
           error_message = NULL, locked_at = NULL
       WHERE id = $1`,
      [job.id, `videos/${job.id}/master.m3u8`, Math.round(duration)],
    )
    await pool.query(
      `UPDATE titles SET duration_min = $2, updated_at = now() WHERE id = $1`,
      [job.title_id, Math.max(1, Math.round(duration / 60))],
    )
    try {
      await notifyRevalidation(job.slug)
    } catch (error) {
      console.error(`Video ${job.id} is ready, but cache revalidation failed:`, error)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 2000) : "Transcoding failed."
    const status = job.attempts >= 3 ? "failed" : "uploaded"
    await pool.query(
      `UPDATE videos
       SET status = $2::video_status, error_message = $3, locked_at = NULL
       WHERE id = $1`,
      [job.id, status, message],
    )
    throw error
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

async function run() {
  console.log("Block Busters transcode worker started.")
  while (!stopping) {
    if (Date.now() - lastSweep > 60_000) {
      await sweepStuckJobs()
      lastSweep = Date.now()
    }
    const job = await claimJob()
    if (!job) {
      await new Promise((resolve) => setTimeout(resolve, 5_000))
      continue
    }
    try {
      await processJob(job)
      console.log(`Transcoded video ${job.id}.`)
    } catch (error) {
      console.error(`Transcode failed for video ${job.id}:`, error)
    }
  }
}

process.on("SIGINT", () => { stopping = true })
process.on("SIGTERM", () => { stopping = true })

run()
  .catch((error: unknown) => {
    console.error("Transcode worker stopped unexpectedly:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
    client.destroy()
  })
