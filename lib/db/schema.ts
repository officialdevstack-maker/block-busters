import {
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

export const titleType = pgEnum("title_type", ["movie", "series"])
export const videoStatus = pgEnum("video_status", [
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
  accent: text("accent").default("#e7a91a"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const videos = pgTable("videos", {
  id: uuid("id").defaultRandom().primaryKey(),
  titleId: uuid("title_id")
    .notNull()
    .references(() => titles.id, { onDelete: "cascade" }),
  sourceKey: text("source_key").notNull(),
  hlsKey: text("hls_key"),
  status: videoStatus("status").notNull().default("uploaded"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
