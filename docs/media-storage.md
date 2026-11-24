# Movie database and media storage

The catalog is stored in PostgreSQL. Video uploads go directly from an
administrator's browser or script to Backblaze B2; playback uses an HLS
playlist produced separately with FFmpeg.

## Configure

Copy the database and B2 variables from `.env.example` into `.env` and fill in
the values from your PostgreSQL provider and B2 bucket. `MEDIA_PUBLIC_URL` must
be the public HTTPS origin that serves the bucket, without a trailing slash.
Keep the B2 application key and database URL server-side; never expose them as
`NEXT_PUBLIC_` variables.

Configure the bucket's CORS rules to allow your app origin and local
development origin, the `GET`, `HEAD`, and `PUT` methods, and the headers used
by signed uploads. Restrict origins before launch.

## Create and seed the catalog

```powershell
npm run db:push
npm run db:seed
```

The seed command inserts the existing sample titles without replacing records
that already exist. Poster URLs remain at their current public locations until
you upload posters and set `poster_key` for a title.

## Upload and publish a video

An authenticated administrator whose email is in `ADMIN_EMAILS` can request a
direct upload URL with `POST /api/admin/upload` and JSON `{ "titleId": "..." }`.
The response contains an `uploadUrl` and `videoId`. `titleId` is the UUID from
the `titles` table. Send the original MP4 to `uploadUrl` with an HTTP `PUT` and
`Content-Type: video/mp4`.

Download the source MP4 from B2, then create the variant output folders and
transcode it to a VOD HLS ladder (1080p, 720p, and 480p) with FFmpeg:

```powershell
$videoId = "<video-id>"
aws s3 cp "s3://$($env:B2_BUCKET)/sources/$videoId.mp4" .\input.mp4 --endpoint-url $env:B2_ENDPOINT
New-Item -ItemType Directory -Force .\out\v0, .\out\v1, .\out\v2 | Out-Null
ffmpeg -i .\input.mp4 `
  -filter_complex "[0:v]split=3[a][b][c];[a]scale=-2:1080[v0];[b]scale=-2:720[v1];[c]scale=-2:480[v2]" `
  -map "[v0]" -map 0:a:0 -map "[v1]" -map 0:a:0 -map "[v2]" -map 0:a:0 `
  -c:v libx264 -preset medium -profile:v main `
  -b:v:0 5000k -maxrate:v:0 5350k -bufsize:v:0 7500k `
  -b:v:1 2800k -maxrate:v:1 2996k -bufsize:v:1 4200k `
  -b:v:2 1200k -maxrate:v:2 1284k -bufsize:v:2 1800k `
  -c:a aac -b:a 128k -ac 2 -g 48 -keyint_min 48 -sc_threshold 0 `
  -f hls -hls_time 6 -hls_playlist_type vod `
  -hls_segment_filename "out/v%v/seg_%03d.ts" `
  -master_pl_name master.m3u8 `
  -var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2" "out/v%v/index.m3u8"
```

Upload the output directory under `videos/<videoId>/` in B2, preserving the
directory structure and setting a long-lived immutable cache header:

```powershell
$env:AWS_ACCESS_KEY_ID = $env:B2_KEY_ID
$env:AWS_SECRET_ACCESS_KEY = $env:B2_APP_KEY
aws s3 sync .\out "s3://$($env:B2_BUCKET)/videos/$videoId/" `
  --endpoint-url $env:B2_ENDPOINT `
  --cache-control "public, max-age=31536000, immutable"
```

Then mark the video row ready:

```sql
UPDATE videos
SET hls_key = 'videos/<videoId>/master.m3u8', status = 'ready'
WHERE id = '<videoId>';
```

The title page only plays a video once a ready HLS playlist is attached. HLS
playback uses native support when available and `hls.js` otherwise. The upload
endpoint does not perform transcoding; run FFmpeg and the B2 sync from a
trusted machine or add a background transcoding worker before accepting
production uploads.
