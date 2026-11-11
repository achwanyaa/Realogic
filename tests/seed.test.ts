import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { anon, as, createDatabase, rows } from "./helpers/db";

it("loads the local sample data on top of the migrations", async () => {
  const db = await createDatabase();
  await db.exec(readFileSync(join(__dirname, "..", "supabase", "seed.sql"), "utf8"));
  const [facts] = await as(db, anon, (tx) =>
    rows<{ n: number }>(tx, "select count(*)::int as n from public.spec_values"),
  );
  expect(facts.n).toBe(14);
});
