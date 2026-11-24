ALTER TYPE video_status ADD VALUE IF NOT EXISTS 'uploading';
--> statement-breakpoint
ALTER TABLE titles
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS backdrop_key text,
  ADD COLUMN IF NOT EXISTS updated_at timestamp NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS admin_request_id uuid;
--> statement-breakpoint
ALTER TABLE titles ALTER COLUMN published SET DEFAULT false;
--> statement-breakpoint
ALTER TABLE titles
  ADD CONSTRAINT titles_admin_request_id_unique UNIQUE (admin_request_id);
--> statement-breakpoint
ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS duration_sec integer,
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_at timestamp,
  ADD COLUMN IF NOT EXISTS upload_id text,
  ADD COLUMN IF NOT EXISTS admin_request_id uuid,
  ADD COLUMN IF NOT EXISTS admin_subject text,
  ADD COLUMN IF NOT EXISTS source_size bigint,
  ADD COLUMN IF NOT EXISTS content_type text;
--> statement-breakpoint
ALTER TABLE videos
  ADD CONSTRAINT videos_admin_request_id_unique UNIQUE (admin_request_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS videos_status_created_at_idx
  ON videos (status, created_at);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS admin_api_rate_limits (
  admin_subject text NOT NULL,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (admin_subject, window_start)
);
