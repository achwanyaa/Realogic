import { beforeAll, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { anon, as, createDatabase, rows, user } from "./helpers/db";

// Two clients, A and B, each with a live and a draft property, a sales person,
// and one buyer who booked a visit. LuxuryBoma has an admin, an editor and a reviewer.
const A = "aaaaaaaa-0000-4000-8000-000000000000";
const B = "bbbbbbbb-0000-4000-8000-000000000000";
const A_LIVE = "aaaaaaaa-0000-4000-8000-000000000001";
const A_DRAFT = "aaaaaaaa-0000-4000-8000-000000000002";
const B_LIVE = "bbbbbbbb-0000-4000-8000-000000000001";
const B_DRAFT = "bbbbbbbb-0000-4000-8000-000000000002";
const A_FACT = "aaaaaaaa-0000-4000-8000-0000000000f1";
const A_LISTING = "aaaaaaaa-0000-4000-8000-0000000000c1";
const B_LISTING = "bbbbbbbb-0000-4000-8000-0000000000c1";
const A_BOOKING = "aaaaaaaa-0000-4000-8000-0000000000b1";

const LB_ADMIN = "11111111-0000-4000-8000-000000000001";
const LB_EDITOR = "11111111-0000-4000-8000-000000000002";
const LB_REVIEWER = "11111111-0000-4000-8000-000000000003";
const STAFF_A = "22222222-0000-4000-8000-00000000000a";
const STAFF_B = "22222222-0000-4000-8000-00000000000b";
const BUYER_A = "33333333-0000-4000-8000-00000000000a";
const BUYER_B = "33333333-0000-4000-8000-00000000000b";

const staffA = user(STAFF_A, { twoFactor: true });
const staffB = user(STAFF_B, { twoFactor: true });
const lbAdmin = user(LB_ADMIN, { twoFactor: true });
const lbEditor = user(LB_EDITOR, { twoFactor: true });
const lbReviewer = user(LB_REVIEWER, { twoFactor: true });
const buyerA = user(BUYER_A);
const buyerB = user(BUYER_B);

let db: PGlite;

beforeAll(async () => {
  db = await createDatabase();
  await db.exec(`
    insert into auth.users (id) values
      ('${LB_ADMIN}'), ('${LB_EDITOR}'), ('${LB_REVIEWER}'),
      ('${STAFF_A}'), ('${STAFF_B}'), ('${BUYER_A}'), ('${BUYER_B}');

    insert into public.clients (id, slug, name, domain, licence_status, briefing_recipients) values
      ('${A}', 'client-a', 'Client A', 'a.example', 'active', '{sales@a.example}'),
      ('${B}', 'client-b', 'Client B', 'b.example', 'active', '{sales@b.example}');

    insert into public.staff_members (user_id, client_id, role) values
      ('${LB_ADMIN}', null, 'lb_admin'),
      ('${LB_EDITOR}', null, 'lb_editor'),
      ('${LB_REVIEWER}', null, 'lb_reviewer'),
      ('${STAFF_A}', '${A}', 'client_staff'),
      ('${STAFF_B}', '${B}', 'client_staff');

    insert into public.properties (id, client_id, reference, slug, name, status, site_visited_on) values
      ('${A_LIVE}', '${A}', 'A-1', 'a-live', 'A live', 'live', date '2026-10-21'),
      ('${A_DRAFT}', '${A}', 'A-2', 'a-draft', 'A draft', 'draft', null),
      ('${B_LIVE}', '${B}', 'B-1', 'b-live', 'B live', 'live', date '2026-11-02'),
      ('${B_DRAFT}', '${B}', 'B-2', 'b-draft', 'B draft', 'draft', null);

    insert into public.spec_values (id, client_id, property_id, spec_key, value_number, display_value, unit, label, checked_on) values
      ('${A_FACT}', '${A}', '${A_LIVE}', 'clear_height', 9.5, '9.5 m', 'm', 'measured', date '2026-10-21');
    insert into public.spec_values (client_id, property_id, spec_key, value_number, display_value, unit, label, checked_on) values
      ('${A}', '${A_DRAFT}', 'clear_height', 8, '8 m', 'm', 'measured', date '2026-10-21'),
      ('${B}', '${B_LIVE}', 'clear_height', 11, '11 m', 'm', 'measured', date '2026-11-02'),
      ('${B}', '${B_DRAFT}', 'clear_height', 7, '7 m', 'm', 'measured', date '2026-11-02');

    insert into public.documents (client_id, property_id, title, author, visibility) values
      ('${A}', '${A_LIVE}', 'A-101 Ground floor plan', 'Sketch3D Ltd', 'signed_in'),
      ('${A}', '${A_LIVE}', 'Internal survey notes', 'LuxuryBoma', 'staff'),
      ('${B}', '${B_DRAFT}', 'B draft plan', 'Sketch3D Ltd', 'public');

    insert into public.listings (id, client_id, property_id, deal, price, price_on_request, status) values
      ('${A_LISTING}', '${A}', '${A_LIVE}', 'lease', 500000, false, 'active'),
      ('${B_LISTING}', '${B}', '${B_LIVE}', 'lease', 900000, false, 'active');
    insert into public.listings (client_id, property_id, deal, status) values
      ('${B}', '${B_DRAFT}', 'sale', 'draft');

    insert into public.industries (key, name) values ('logistics', 'Logistics and warehousing');

    insert into public.buyer_profiles (user_id, full_name, phone, consent_at, consent_version) values
      ('${BUYER_A}', 'Buyer of A', '+254700000001', now(), 'v1'),
      ('${BUYER_B}', 'Buyer of B', '+254700000002', now(), 'v1');
    insert into public.leads (client_id, buyer_id, notes) values
      ('${A}', '${BUYER_A}', 'Wants 2 loading doors'),
      ('${B}', '${BUYER_B}', 'Budget confirmed');
    insert into public.bookings (id, client_id, property_id, buyer_id, preferred_day, preferred_time) values
      ('${A_BOOKING}', '${A}', '${A_LIVE}', '${BUYER_A}', date '2026-11-17', 'morning');
    insert into public.bookings (client_id, property_id, buyer_id, preferred_day, preferred_time) values
      ('${B}', '${B_LIVE}', '${BUYER_B}', date '2026-11-19', 'afternoon');
    insert into public.fit_results (client_id, property_id, buyer_id, industry_key, verdict) values
      ('${A}', '${A_LIVE}', '${BUYER_A}', 'logistics', 'fits'),
      ('${B}', '${B_LIVE}', '${BUYER_B}', 'logistics', 'does_not_fit');
    insert into public.saved_properties (buyer_id, client_id, property_id) values
      ('${BUYER_A}', '${A}', '${A_LIVE}'),
      ('${BUYER_B}', '${B}', '${B_LIVE}');
    insert into public.events (client_id, property_id, type) values
      ('${A}', '${A_LIVE}', 'dossier_view'),
      ('${B}', '${B_LIVE}', 'dossier_view');
  `);
});

/** How many of one client's rows a caller can see in a table. */
async function visibleRows(table: string, client: string, caller: Parameters<typeof as>[1]) {
  const column = table === "clients" ? "id" : "client_id";
  const [found] = await as(db, caller, (tx) =>
    rows<{ n: number }>(tx, `select count(*)::int as n from public.${table} where ${column} = $1`, [client]),
  );
  return found.n;
}

// A signed-in member of the public with no link to either client.
const stranger = user("99999999-0000-4000-8000-000000000000");

const CLIENT_TABLES = [
  "clients", "properties", "spaces", "spec_values", "spec_value_history", "documents", "media",
  "listings", "leads", "saved_properties", "fit_results", "bookings", "correction_requests",
  "events", "audit_log",
];

describe("every table is walled", () => {
  it("has row-level security switched on for every table in the public schema", async () => {
    const open = await rows(
      db,
      `select tablename from pg_tables where schemaname = 'public' and not rowsecurity`,
    );
    expect(open).toEqual([]);
  });

  it("carries a mandatory client id on every client table", async () => {
    const tables = CLIENT_TABLES.filter((t) => !["clients", "audit_log"].includes(t));
    const found = await rows<{ table_name: string }>(
      db,
      `select table_name from information_schema.columns
       where table_schema = 'public' and column_name = 'client_id' and is_nullable = 'NO'`,
    );
    expect(found.map((r) => r.table_name)).toEqual(expect.arrayContaining(tables));
  });
});

describe("one client cannot read another client's data", () => {
  // Live properties, their facts and active listings are public by design, so the
  // wall is: staff of one client see no more of another client than a stranger does.
  it.each(CLIENT_TABLES)("client A's staff see nothing of client B beyond the public in %s", async (table) => {
    expect(await visibleRows(table, B, staffA)).toBe(await visibleRows(table, B, stranger));
  });

  it.each(CLIENT_TABLES)("client B's staff see nothing of client A beyond the public in %s", async (table) => {
    expect(await visibleRows(table, A, staffB)).toBe(await visibleRows(table, A, stranger));
  });

  it.each(["clients", "leads", "saved_properties", "fit_results", "bookings", "correction_requests", "events", "audit_log"])(
    "a stranger sees no client rows at all in %s",
    async (table) => {
      expect(await visibleRows(table, A, stranger)).toBe(0);
      expect(await visibleRows(table, B, stranger)).toBe(0);
    },
  );

  it("does give staff their own client's rows in every table that has some", async () => {
    for (const table of ["clients", "properties", "spec_values", "documents", "listings", "leads", "saved_properties", "fit_results", "bookings", "events", "audit_log"]) {
      expect(await visibleRows(table, A, staffA), table).toBeGreaterThan(0);
    }
    expect(await visibleRows("properties", A, staffA)).toBe(2);
    expect(await visibleRows("properties", A, stranger)).toBe(1);
  });

  it("lets staff see their own client's drafts, bookings, leads and buyers, and only those", async () => {
    const seen = await as(db, staffA, async (tx) => ({
      properties: (await rows<{ id: string }>(tx, "select id from public.properties")).map((r) => r.id).sort(),
      bookings: await rows<{ client_id: string }>(tx, "select client_id from public.bookings"),
      leads: await rows<{ notes: string }>(tx, "select notes from public.leads"),
      buyers: await rows<{ full_name: string }>(tx, "select full_name from public.buyer_profiles"),
    }));
    expect(seen.properties).toEqual([A_LIVE, A_DRAFT, B_LIVE].sort());
    expect(seen.bookings).toEqual([{ client_id: A }]);
    expect(seen.leads).toEqual([{ notes: "Wants 2 loading doors" }]);
    expect(seen.buyers).toEqual([{ full_name: "Buyer of A" }]);
  });

  it("stops staff from changing another client's listing or booking", async () => {
    const changed = await as(db, staffA, async (tx) => {
      const listing = await tx.query(`update public.listings set price = 1 where id = '${B_LISTING}'`);
      const booking = await tx.query(`update public.bookings set status = 'confirmed' where client_id = '${B}'`);
      return (listing.affectedRows ?? 0) + (booking.affectedRows ?? 0);
    });
    expect(changed).toBe(0);
  });

  it("treats a staff account without two-factor sign-in as an ordinary visitor", async () => {
    const weak = user(STAFF_A, { twoFactor: false });
    const seen = await as(db, weak, async (tx) => ({
      properties: (await rows<{ id: string }>(tx, "select id from public.properties")).map((r) => r.id).sort(),
      bookings: await rows(tx, "select id from public.bookings"),
      leads: await rows(tx, "select id from public.leads"),
    }));
    expect(seen.properties).toEqual([A_LIVE, B_LIVE].sort());
    expect(seen.bookings).toEqual([]);
    expect(seen.leads).toEqual([]);
  });
});

describe("the public sees only what is live", () => {
  it("shows live properties and their facts, never drafts", async () => {
    const seen = await as(db, anon, async (tx) => ({
      properties: (await rows<{ id: string }>(tx, "select id from public.properties")).map((r) => r.id).sort(),
      facts: (await rows<{ property_id: string }>(tx, "select property_id from public.spec_values")).map((r) => r.property_id).sort(),
      listings: (await rows<{ id: string }>(tx, "select id from public.listings")).map((r) => r.id).sort(),
    }));
    expect(seen.properties).toEqual([A_LIVE, B_LIVE].sort());
    expect(seen.facts).toEqual([A_LIVE, B_LIVE].sort());
    expect(seen.listings).toEqual([A_LISTING, B_LISTING].sort());
  });

  it("keeps documents behind sign-in and staff-only documents with staff", async () => {
    const titles = (caller: Parameters<typeof as>[1]) =>
      as(db, caller, async (tx) =>
        (await rows<{ title: string }>(tx, "select title from public.documents order by title")).map((r) => r.title),
      );
    expect(await titles(anon)).toEqual([]);
    expect(await titles(buyerB)).toEqual(["A-101 Ground floor plan"]);
    expect(await titles(staffA)).toEqual(["A-101 Ground floor plan", "Internal survey notes"]);
  });

  it("gives visitors no access to buyers, bookings, leads, staff or logs", async () => {
    for (const table of ["buyer_profiles", "bookings", "leads", "staff_members", "audit_log", "events", "clients"]) {
      await expect(as(db, anon, (tx) => rows(tx, `select * from public.${table}`))).rejects.toThrow(/permission denied/);
    }
  });

  it("gives a portal its client's branding without the private settings", async () => {
    const [client] = await as(db, anon, (tx) =>
      rows<Record<string, unknown>>(tx, "select * from public.get_site_client(p_domain => 'a.example')"),
    );
    expect(client.name).toBe("Client A");
    expect(client).not.toHaveProperty("briefing_recipients");
    expect(client).not.toHaveProperty("licence_status");
  });
});

describe("buyers see only their own activity", () => {
  it("shows a buyer their own bookings, fit results and saved properties", async () => {
    const seen = await as(db, buyerA, async (tx) => ({
      bookings: await rows<{ buyer_id: string }>(tx, "select buyer_id from public.bookings"),
      fits: await rows<{ buyer_id: string }>(tx, "select buyer_id from public.fit_results"),
      saved: await rows<{ buyer_id: string }>(tx, "select buyer_id from public.saved_properties"),
      profiles: await rows<{ user_id: string }>(tx, "select user_id from public.buyer_profiles"),
      leads: await rows(tx, "select * from public.leads"),
    }));
    expect(seen.bookings).toEqual([{ buyer_id: BUYER_A }]);
    expect(seen.fits).toEqual([{ buyer_id: BUYER_A }]);
    expect(seen.saved).toEqual([{ buyer_id: BUYER_A }]);
    expect(seen.profiles).toEqual([{ user_id: BUYER_A }]);
    expect(seen.leads).toEqual([]);
  });

  it("lets a buyer request a visit to a live property, as themselves only", async () => {
    const booking = (buyer: string, property: string, client: string, extra = "") =>
      `insert into public.bookings (client_id, property_id, buyer_id, preferred_day, preferred_time${extra ? ", status" : ""})
       values ('${client}', '${property}', '${buyer}', date '2026-11-20', 'morning'${extra})`;
    await expect(as(db, buyerA, (tx) => tx.query(booking(BUYER_A, B_LIVE, B)))).resolves.toBeDefined();
    await expect(as(db, buyerA, (tx) => tx.query(booking(BUYER_B, B_LIVE, B)))).rejects.toThrow(/row-level security/);
    await expect(as(db, buyerA, (tx) => tx.query(booking(BUYER_A, A_DRAFT, A)))).rejects.toThrow(/row-level security/);
    await expect(as(db, buyerA, (tx) => tx.query(booking(BUYER_A, A_LIVE, A, ", 'confirmed'")))).rejects.toThrow(/row-level security/);
    // A property can never be booked under another client's id.
    await expect(as(db, buyerA, (tx) => tx.query(booking(BUYER_A, A_LIVE, B)))).rejects.toThrow(/foreign key/);
  });

  it("links a buyer to a client only through register_interest, for themselves", async () => {
    const leads = await as(db, buyerA, async (tx) => {
      await tx.query(`select public.register_interest('${B}')`);
      await tx.exec("reset role");
      return rows<{ client_id: string }>(tx, `select client_id from public.leads where buyer_id = '${BUYER_A}' order by client_id`);
    });
    expect(leads.map((l) => l.client_id)).toEqual([A, B]);
    await expect(as(db, anon, (tx) => tx.query(`select public.register_interest('${B}')`))).rejects.toThrow(/permission denied/);
  });
});

describe("independence rules", () => {
  it("stops the client from editing, adding or removing a verified fact", async () => {
    const changed = await as(db, staffA, async (tx) => {
      const update = await tx.query(`update public.spec_values set value_number = 12, display_value = '12 m' where id = '${A_FACT}'`);
      const remove = await tx.query(`delete from public.spec_values where id = '${A_FACT}'`);
      return (update.affectedRows ?? 0) + (remove.affectedRows ?? 0);
    });
    expect(changed).toBe(0);
    await expect(
      as(db, staffA, (tx) =>
        tx.query(`insert into public.spec_values (client_id, property_id, spec_key, value_number, display_value, label, checked_on)
                  values ('${A}', '${A_LIVE}', 'gate_width', 9, '9 m', 'measured', current_date)`),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it("stops the client from editing or hiding its own property record", async () => {
    const changed = await as(db, staffA, async (tx) => {
      const result = await tx.query(`update public.properties set status = 'paused', name = 'Better name' where id = '${A_LIVE}'`);
      return result.affectedRows ?? 0;
    });
    expect(changed).toBe(0);
  });

  it("lets the client change price, availability and description, and nothing else on a listing", async () => {
    const price = await as(db, staffA, async (tx) => {
      await tx.query(
        `update public.listings set price = 650000, available_from = date '2027-02-01', description = 'New text' where id = '${A_LISTING}'`,
      );
      const [row] = await rows<{ price: string }>(tx, `select price from public.listings where id = '${A_LISTING}'`);
      return Number(row.price);
    });
    expect(price).toBe(650000);
    await expect(
      as(db, staffA, (tx) => tx.query(`update public.listings set deal = 'sale' where id = '${A_LISTING}'`)),
    ).rejects.toThrow(/only price, availability and description/);
    await expect(
      as(db, staffA, (tx) => tx.query(`update public.listings set status = 'closed' where id = '${A_LISTING}'`)),
    ).rejects.toThrow(/only price, availability and description/);
  });

  it("lets the client ask for a correction instead", async () => {
    const request = `insert into public.correction_requests (client_id, property_id, spec_value_id, requested_by, message)
                     values ('${A}', '${A_LIVE}', '${A_FACT}', '${STAFF_A}', 'Clear height is 9.8 m after the new truss')`;
    await expect(as(db, staffA, (tx) => tx.query(request))).resolves.toBeDefined();
    await expect(as(db, staffB, (tx) => tx.query(request))).rejects.toThrow(/row-level security/);
  });

  it("keeps the earlier version when LuxuryBoma corrects a fact", async () => {
    const history = await as(db, lbEditor, async (tx) => {
      await tx.query(`update public.spec_values set value_number = 9.8, display_value = '9.8 m' where id = '${A_FACT}'`);
      return rows<{ old_value: string; changed_by: string }>(
        tx,
        `select old_row ->> 'display_value' as old_value, changed_by from public.spec_value_history where spec_value_id = '${A_FACT}'`,
      );
    });
    expect(history).toEqual([{ old_value: "9.5 m", changed_by: LB_EDITOR }]);
  });

  it("lets nobody rewrite fact history or the audit log", async () => {
    for (const statement of [
      "delete from public.spec_value_history",
      "update public.spec_value_history set old_row = '{}'",
      "delete from public.audit_log",
      "insert into public.audit_log (table_name, action) values ('x', 'INSERT')",
    ]) {
      await expect(as(db, lbAdmin, (tx) => tx.query(statement))).rejects.toThrow(/permission denied/);
    }
  });

  it("requires the author to be named on a fact taken from drawings", async () => {
    const insert = (source: string | null) =>
      as(db, lbEditor, (tx) =>
        tx.query(
          `insert into public.spec_values (client_id, property_id, spec_key, value_number, display_value, label, source)
           values ('${A}', '${A_LIVE}', 'yard_area', 900, '900 m²', 'from_drawings', $1)`,
          [source],
        ),
      );
    await expect(insert(null)).rejects.toThrow(/drawings_name_their_author/);
    await expect(insert("  ")).rejects.toThrow(/drawings_name_their_author/);
    await expect(insert("Drawing A-101 rev C, Sketch3D Ltd (developer's architect)")).resolves.toBeDefined();
  });

  it("puts a property live only after a site visit, and only by a reviewer or admin", async () => {
    const publish = (caller: Parameters<typeof as>[1], visited: boolean) =>
      as(db, caller, (tx) =>
        tx.query(
          `update public.properties set status = 'live'${visited ? ", site_visited_on = date '2026-11-10'" : ""} where id = '${A_DRAFT}'`,
        ),
      );
    await expect(publish(lbEditor, true)).rejects.toThrow(/reviewer or admin/);
    await expect(publish(lbReviewer, false)).rejects.toThrow(/live_needs_site_visit/);
    await expect(publish(lbReviewer, true)).resolves.toBeDefined();
    await expect(publish(lbAdmin, true)).resolves.toBeDefined();
  });

  it("records who changed what in the audit log", async () => {
    const entries = await as(db, lbEditor, async (tx) => {
      await tx.query(`update public.properties set near = 'near Syokimau' where id = '${A_LIVE}'`);
      await tx.exec("reset role");
      return rows<{ actor: string; client_id: string; action: string }>(
        tx,
        `select actor, client_id, action from public.audit_log where table_name = 'properties' and row_id = '${A_LIVE}' and action = 'UPDATE'`,
      );
    });
    expect(entries).toEqual([{ actor: LB_EDITOR, client_id: A, action: "UPDATE" }]);
  });
});
