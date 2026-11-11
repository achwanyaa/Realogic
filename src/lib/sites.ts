// One codebase serves three kinds of site, chosen by the domain of the request:
//   - a client's portal (Realogic first), under /sites/[site]
//   - the LuxuryBoma console for our own staff, under /console
//   - luxuryboma.com, under /lb
// src/proxy.ts rewrites each request to the right folder, so visitors only
// ever see clean addresses like realogic.example/properties.

export type Site = {
  slug: string;
  name: string;
  wordmark: string;
  wordmarkSub: string;
  legalName: string;
  tagline: string;
  phone: string;
  phoneHref: string;
  whatsapp: string;
  email: string;
  postalAddress: string;
  designedBy: string;
  /** Production domains that serve this portal. */
  domains: string[];
};

// Branding and contact details will move to the `clients` table (read through
// get_site_client) once the database is connected. Until then they live here.
export const SITES: Record<string, Site> = {
  realogic: {
    slug: "realogic",
    name: "Realogic Properties",
    wordmark: "REALOGIC",
    wordmarkSub: "PROPERTIES",
    legalName: "Realogic Properties Limited",
    tagline:
      "Providing property solutions in building maintenance, plumbing, electrical and landscaping work. Godowns designed by Sketch3D Ltd.",
    phone: "+254 725 073 496",
    phoneHref: "tel:+254725073496",
    whatsapp: "254725073496",
    email: "realogicacc@gmail.com",
    postalAddress: "P.O. Box 249-00100, Nairobi",
    designedBy: "Sketch3D Ltd",
    domains: [], // Realogic's domain is still to be confirmed.
  },
};

export const LUXURYBOMA_DOMAINS = ["luxuryboma.com", "www.luxuryboma.com"];
export const CONSOLE_DOMAINS = ["console.luxuryboma.com"];

export const DISCLOSURE = {
  short: "Realogic and LuxuryBoma share an owner. LuxuryBoma checks every client the same way.",
  full: "Designed by Sketch3D · developed and listed by Realogic · verified by LuxuryBoma. Realogic and LuxuryBoma share an owner.",
};

export function getSite(slug: string): Site | undefined {
  return Object.hasOwn(SITES, slug) ? SITES[slug] : undefined;
}

/**
 * The folder a request belongs to, from its Host header.
 *
 * In development, use realogic.localhost:3000, console.localhost:3000 and
 * luxuryboma.localhost:3000. Plain localhost and Vercel preview links show
 * the site named in DEFAULT_SITE (realogic unless set otherwise).
 */
export function routePrefixForHost(host: string | null, defaultSite = "realogic"): string {
  const hostname = (host ?? "").split(":")[0].toLowerCase();

  if (CONSOLE_DOMAINS.includes(hostname) || hostname === "console.localhost") return "/console";
  if (LUXURYBOMA_DOMAINS.includes(hostname) || hostname === "luxuryboma.localhost") return "/lb";

  for (const site of Object.values(SITES)) {
    if (site.domains.includes(hostname) || hostname === `${site.slug}.localhost`) {
      return `/sites/${site.slug}`;
    }
  }

  if (defaultSite === "console") return "/console";
  if (defaultSite === "luxuryboma") return "/lb";
  return `/sites/${getSite(defaultSite)?.slug ?? "realogic"}`;
}
