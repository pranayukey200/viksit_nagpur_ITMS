import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

let pool: Pool | undefined;
let db: any;

if (databaseUrl) {
  pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }

  db = drizzle(pool);
} else {
  // Export a proxy that throws when any DB operation is attempted.
  // This prevents build-time failures on platforms like Vercel for frontend-only previews.
  const handler: ProxyHandler<object> = {
    get() {
      throw new Error(
        "DATABASE_URL is not set. Database operations are unavailable in this deployment."
      );
    },
    apply() {
      throw new Error(
        "DATABASE_URL is not set. Database operations are unavailable in this deployment."
      );
    },
  };

  db = new Proxy({}, handler);
}

export { pool, db };
