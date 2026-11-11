import { notFound } from "next/navigation";
import { ProvenancePill } from "@/components/ProvenancePill";
import { getSite } from "@/lib/sites";

const SERVICES = [
  { title: "Fit-out", text: "Extra loading doors, offices, partitions and floor finishes, quoted from the fit check." },
  { title: "Electrical", text: "Power upgrades, lighting and backup power." },
  { title: "Plumbing", text: "Water storage, rainwater harvesting and drainage." },
  { title: "Building maintenance", text: "Roofing, painting and repairs after you move in." },
  { title: "Landscaping", text: "Yards, drainage and grounds." },
];

export default async function PortalHome({ params }: PageProps<"/sites/[site]">) {
  const site = getSite((await params).site);
  if (!site) notFound();

  return (
    <>
      <div className="bg-notice-bg text-[13px] font-semibold text-notice">
        <div className="mx-auto max-w-[1180px] px-5 py-2">
          Site under construction. Listings appear here once the first godown has been entered and checked.
        </div>
      </div>

      <section className="blueprint border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-5 py-12">
          <span className="flex items-center gap-2.5 text-xs font-semibold tracking-[1.6px] text-blue uppercase">
            <span className="h-0.5 w-7 bg-blue" />
            Industrial godowns · Nairobi and surrounds
          </span>
          <h1 className="max-w-[720px] text-[44px] leading-[52px] font-extrabold tracking-[-0.5px] text-navy">
            Industrial space you can judge before you visit.
          </h1>
          <p className="max-w-[620px] text-[17px] leading-[27px] text-muted">
            Realogic builds, leases and maintains godowns. Every key fact on our listings is labelled
            measured, from drawings or declared, and checked independently by LuxuryBoma.
          </p>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1180px] flex-wrap gap-4 px-5 py-7">
        <div className="flex flex-[1_1_380px] flex-col gap-3 rounded-card bg-blue-tint p-6">
          <h2 className="text-[22px] font-extrabold text-navy">Will it work for your business?</h2>
          <p className="leading-[25px] text-body">
            Pick your industry. We compare what you need with each godown&apos;s checked facts and tell
            you plainly: fits, fits with changes, or doesn&apos;t fit.
          </p>
        </div>
        <div className="flex flex-[1_1_380px] flex-col gap-3 rounded-card border border-line bg-white p-6">
          <h2 className="text-[22px] font-extrabold text-navy">How our numbers are checked</h2>
          <p className="text-[15px] leading-[23px] text-muted">
            Every fact carries one label, set by LuxuryBoma, not by us. We can&apos;t edit or hide a
            verified fact.
          </p>
          <div className="flex flex-col gap-2.5 text-sm">
            <span className="flex items-center gap-3">
              <ProvenancePill kind="measured" />
              Measured on site by LuxuryBoma
            </span>
            <span className="flex items-center gap-3">
              <ProvenancePill kind="from_drawings" />
              From the architect&apos;s drawings, named
            </span>
            <span className="flex items-center gap-3">
              <ProvenancePill kind="declared" />
              Our word only, not yet checked
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1180px] flex-col gap-4 px-5 pt-2 pb-11">
        <h2 className="text-2xl font-extrabold text-navy">After you move in</h2>
        <p className="max-w-[680px] leading-[25px] text-muted">
          Realogic also fits out and maintains the space, so changes a fit check flags can be quoted and
          done by the people who built it.
        </p>
        <div className="flex flex-wrap gap-3">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="flex flex-[1_1_200px] flex-col gap-1.5 rounded-card border border-line bg-white p-[18px]"
            >
              <span className="font-bold text-navy">{service.title}</span>
              <span className="text-sm leading-[21px] text-muted">{service.text}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
