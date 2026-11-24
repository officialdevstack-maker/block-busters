import "server-only"

import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"

import * as schema from "@/lib/db/schema"

type GlobalWithPool = typeof globalThis & {
  __blockBustersDbPool?: Pool
}

const globalForDb = globalThis as GlobalWithPool

export function getDb() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL must be set to access the movie database.")
  }

  const pool =
    globalForDb.__blockBustersDbPool ??
    new Pool({ connectionString, max: 5 })
  globalForDb.__blockBustersDbPool = pool

  return drizzle(pool, { schema })
}

export async function closeDb() {
  const pool = globalForDb.__blockBustersDbPool
  if (pool) {
    delete globalForDb.__blockBustersDbPool
    await pool.end()
  }
}
