import {
  bigint,
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

export const titleType = pgEnum("title_type", ["movie", "series"])
export const videoStatus = pgEnum("video_status", [
  "uploading",
  "uploaded",
  "processing",
  "ready",
  "failed",
])

export const titles = pgTable("titles", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  year: integer("year").notNull(),
  rating: real("rating"),
  genre: text("genre").notNull(),
  type: titleType("type").notNull().default("movie"),
  durationMin: integer("duration_min"),
  description: text("description"),
  posterKey: text("poster_key"),
  posterUrl: text("poster_url"),
  backdropKey: text("backdrop_key"),
  accent: text("accent").default("#e7a91a"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  adminRequestId: uuid("admin_request_id").unique(),
})

export const videos = pgTable("videos", {
  id: uuid("id").defaultRandom().primaryKey(),
  titleId: uuid("title_id")
    .notNull()
    .references(() => titles.id, { onDelete: "cascade" }),
  sourceKey: text("source_key").notNull(),
  hlsKey: text("hls_key"),
  status: videoStatus("status").notNull().default("uploaded"),
  durationSec: integer("duration_sec"),
  errorMessage: text("error_message"),
  attempts: integer("attempts").notNull().default(0),
  lockedAt: timestamp("locked_at"),
  uploadId: text("upload_id"),
  adminRequestId: uuid("admin_request_id").unique(),
  adminSubject: text("admin_subject"),
  sourceSize: bigint("source_size", { mode: "number" }),
  contentType: text("content_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const adminApiRateLimits = pgTable("admin_api_rate_limits", {
  adminSubject: text("admin_subject").notNull(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  requestCount: integer("request_count").notNull().default(0),
}, (table) => [primaryKey({ columns: [table.adminSubject, table.windowStart] })])
