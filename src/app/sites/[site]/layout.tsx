import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DISCLOSURE, getSite, SITES } from "@/lib/sites";

export function generateStaticParams() {
  return Object.keys(SITES).map((site) => ({ site }));
}

export async function generateMetadata({ params }: LayoutProps<"/sites/[site]">): Promise<Metadata> {
  const site = getSite((await params).site);
  if (!site) return {};
  return {
    title: { default: site.name, template: `%s · ${site.name}` },
    description: "Industrial godowns with every key fact labelled and checked by LuxuryBoma.",
  };
}

function ChatIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
    </svg>
  );
}

export default async function PortalLayout({ children, params }: LayoutProps<"/sites/[site]">) {
  const site = getSite((await params).site);
  if (!site) notFound();

  const navLink = "flex min-h-11 items-center px-3 text-[15px] font-semibold text-muted hover:text-blue";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-white">
        <div className="bg-navy text-xs text-[#C9D4E6]">
          <div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-x-4 gap-y-1.5 px-5 py-[7px]">
            <span>
              {site.postalAddress} · {site.phone} · {site.email}
            </span>
            <span className="font-lb font-semibold text-white">Listings verified by LuxuryBoma</span>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-2 px-5 py-2">
          <Link href="/" aria-label={`${site.name} home`} className="flex flex-col py-1 leading-[1.15]">
            <span className="font-wordmark text-[17px] font-extrabold tracking-[0.4px] text-navy">
              {site.wordmark}
            </span>
            <span className="text-[11px] font-semibold tracking-[2px] text-muted">{site.wordmarkSub}</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-0.5">
            {/* Properties and Fit check links are added with those pages (milestones 4 and 5). */}
            <a href="#contact" className={navLink}>
              Contact
            </a>
            <a
              href={`https://wa.me/${site.whatsapp}`}
              className="ml-1.5 flex min-h-11 items-center gap-2 rounded-control bg-blue px-4 text-[15px] font-bold text-white hover:bg-blue-hover"
            >
              <ChatIcon />
              WhatsApp us
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer id="contact" className="bg-navy text-white">
        <div className="mx-auto flex max-w-[1180px] flex-wrap gap-x-10 gap-y-7 px-5 pt-9 pb-7">
          <div className="flex flex-[2_1_320px] flex-col gap-2.5">
            <span className="font-wordmark text-lg font-extrabold tracking-[0.4px] uppercase">
              {site.legalName}
            </span>
            <span className="text-sm leading-[21px] text-[#C9D4E6]">{site.tagline}</span>
          </div>
          <div className="flex flex-[1_1_220px] flex-col gap-2 text-sm leading-[21px]">
            <span className="font-bold">Contact</span>
            <a href={site.phoneHref}>{site.phone}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <span className="text-[#C9D4E6]">{site.postalAddress}, Kenya</span>
          </div>
          <div className="flex flex-[1_1_240px] flex-col gap-2 font-lb text-sm leading-[21px]">
            <span className="font-bold">Facts verified by LuxuryBoma</span>
            <span className="text-[#C9D4E6]">{DISCLOSURE.short}</span>
          </div>
        </div>
        <div className="border-t border-[#22324F]">
          <div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-2 px-5 py-3.5 text-[13px] text-[#C9D4E6]">
            <span>© 2026 {site.legalName}</span>
            <span className="font-lb">Powered by LuxuryBoma</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
