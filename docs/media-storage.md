# Block Busters media and worker

Block Busters owns its PostgreSQL schema and B2 access. Admin 2 proxies
management requests to the Block Busters internal API; video and image bytes
move directly from the browser to B2 using presigned URLs.

## Buckets and credentials

Use separate buckets because B2 visibility is configured per bucket:

- `B2_PRIVATE_BUCKET` stores raw files at `sources/<videoId>.<ext>`.
- `B2_PUBLIC_BUCKET` stores HLS at `videos/<videoId>/...` and artwork under
  `posters/` and `backdrops/`.
- `MEDIA_PUBLIC_URL` is the HTTPS CDN origin for the public bucket only.

The Block Busters app key is server-only and can read/write/delete objects in
both buckets. The worker key can read/delete from the private bucket and
write to the public bucket. Admin 2 holds no B2 keys.

Configure bucket CORS explicitly. The private bucket must allow the Admin 2
origins and `http://localhost:3000`, methods `PUT`, `GET`, and `HEAD`, headers
`*`, and expose `ETag` for multipart uploads. The public bucket must allow the
Block Busters and Admin 2 origins plus localhost, methods `GET`, `HEAD`, and
`PUT`, headers `*`. Restrict origins before launch.

## Schema and seed data

The base `titles` and `videos` tables must already exist. Apply the additive
admin/media migration with:

```powershell
npm run db:migrate
```

For future schema changes, update `lib/db/schema.ts`, generate a migration with
`npm run db:generate`, inspect the SQL, and apply it with `npm run db:migrate`.
Do not use `db:push` for production. The sample seed titles are published demo
records; titles created through Admin 2 start as drafts.

## Admin API and uploads

Admin 2 authenticates its users locally and signs a short-lived RSA identity
for each API call. Block Busters verifies it with `ADMIN_IDENTITY_PUBLIC_KEY`
and enforces the route permission. Configure the matching
`BLOCKBUSTERS_ADMIN_IDENTITY_PRIVATE_KEY` and `BLOCKBUSTERS_API_URL` in Admin 2.
`ADMIN_EMAILS` and a shared revalidation secret are not used.

The Admin 2 title/video pages request upload plans from the Block Busters
internal API. Files are uploaded directly to B2:

- MP4, MOV, MKV and WebM sources up to 250 GB are accepted.
- Files under 100 MB use a single presigned PUT.
- Larger files use 25 MiB multipart parts, uploaded four at a time. The
  browser collects each part's `ETag` and calls the complete endpoint.
- Upload plans expire after one hour. Incomplete multipart uploads should be
  removed from the private bucket by a one-day B2 lifecycle rule.
- Posters and backdrops accept JPEG, PNG or WebP up to 5 MB.

Do not pass file contents through either application server. The private
bucket must not be public; only HLS and image objects belong in the public
bucket.

## Transcode worker

Run one or more long-lived Node processes with `ffmpeg`, `ffprobe`, and the
worker-specific PostgreSQL/B2 credentials. The process claims rows with
`FOR UPDATE SKIP LOCKED`, downloads the source to a temporary directory,
creates a VOD HLS ladder, uploads playlists and segments to the public bucket,
then marks the video ready. It supports sources without audio and skips
renditions above the source resolution. Failed jobs retry automatically up to
three attempts; the sweeper recovers processing jobs locked for over two hours.

Start the worker with:

```powershell
npm run worker
```

Worker environment:

```env
DATABASE_URL=postgresql://bb_worker:...@host/blockbusters
B2_ENDPOINT=https://s3.<region>.backblazeb2.com
B2_REGION=<region>
B2_KEY_ID=<worker-key-id>
B2_APP_KEY=<worker-key>
B2_PRIVATE_BUCKET=bb-private
B2_PUBLIC_BUCKET=bb-public
BLOCKBUSTERS_URL=https://your-blockbusters-origin
WORKER_SECRET=<same-secret-as-the-app>
```

Grant `bb_worker` only `SELECT` on `titles`, and `SELECT`/`UPDATE` on `videos`.
The app's `WORKER_SECRET` must be at least 32 characters. The worker uses it
only for `POST /api/internal/worker/revalidate`; do not expose that endpoint
secret in browser or Admin 2 configuration.

The worker keeps source files by default for possible re-encoding. HLS
playlists use a short cache lifetime; segments are immutable. If a video
becomes ready but cache revalidation fails, it remains ready and the worker
logs the refresh failure.
