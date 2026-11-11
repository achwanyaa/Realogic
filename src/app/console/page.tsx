import type { Metadata } from "next";

export const metadata: Metadata = { title: "LuxuryBoma console" };

// Milestone 2: staff sign-in with two-factor, then screens to enter properties,
// specs with provenance, media and documents.
export default function ConsoleHome() {
  return (
    <main className="mx-auto flex max-w-[720px] flex-1 flex-col justify-center gap-3 px-5 py-16 font-lb">
      <span className="text-sm font-bold text-lb">LuxuryBoma console</span>
      <h1 className="text-3xl font-extrabold text-lb-deep">Staff sign-in comes next.</h1>
      <p className="text-lb-muted">
        This is where LuxuryBoma enters properties, facts with their provenance, media and documents.
      </p>
    </main>
  );
}
