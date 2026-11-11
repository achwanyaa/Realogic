import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite, type Transaction } from "@electric-sql/pglite";

const MIGRATIONS_DIR = join(__dirname, "..", "..", "supabase", "migrations");

// The small part of Supabase the migrations rely on: its three API roles, the
// auth.users table and the auth.uid() / auth.jwt() helpers. The definitions
// mirror Supabase's own, reading the signed-in user from request.jwt.claims.
const SUPABASE_SHIM = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;

  create schema auth;
  create table auth.users (id uuid primary key, phone text, email text);

  create function auth.jwt() returns jsonb language sql stable as $$
    select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb;
  $$;
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(auth.jwt() ->> 'sub', '')::uuid;
  $$;
  create function auth.role() returns text language sql stable as $$
    select auth.jwt() ->> 'role';
  $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on all functions in schema auth to anon, authenticated, service_role;
`;

/** A fresh in-memory Postgres with the Supabase shim and every migration applied. */
export async function createDatabase(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(SUPABASE_SHIM);
  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    try {
      await db.exec(readFileSync(join(MIGRATIONS_DIR, file), "utf8"));
    } catch (error) {
      throw new Error(`Migration ${file} failed: ${(error as Error).message}`);
    }
  }
  return db;
}

export type Caller =
  | { kind: "anon" }
  | { kind: "user"; id: string; twoFactor?: boolean };

export const anon: Caller = { kind: "anon" };
export const user = (id: string, opts: { twoFactor?: boolean } = {}): Caller => ({
  kind: "user",
  id,
  twoFactor: opts.twoFactor ?? false,
});

/**
 * Runs `fn` exactly as the API would for this caller: the anon or authenticated
 * role with the caller's JWT claims, so row-level security applies. Everything
 * is rolled back afterwards, so tests never affect each other.
 */
export async function as<T>(
  db: PGlite,
  caller: Caller,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  const role = caller.kind === "anon" ? "anon" : "authenticated";
  const claims =
    caller.kind === "anon"
      ? { role }
      : { role, sub: caller.id, aal: caller.twoFactor ? "aal2" : "aal1" };
  return db.transaction(async (tx) => {
    await tx.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify(claims)]);
    await tx.exec(`set local role ${role}`);
    try {
      return await fn(tx);
    } finally {
      await tx.rollback();
    }
  }) as Promise<T>;
}

/** Rows returned by a query, as plain objects. */
export async function rows<T = Record<string, unknown>>(
  tx: Transaction | PGlite,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await tx.query<T>(sql, params);
  return result.rows;
}
