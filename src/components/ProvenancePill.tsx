import type { ReactNode } from "react";

// LuxuryBoma's provenance label. It keeps LuxuryBoma's own typeface and colours
// wherever it appears, including inside a client's portal. The values match
// the `provenance_label` type in the database.
export type Provenance =
  | "measured"
  | "from_drawings"
  | "declared"
  | "indicative"
  | "not_found"
  | "not_yet_checked";

const LABELS: Record<Provenance, { text: string; className: string; icon: ReactNode }> = {
  measured: {
    text: "Measured",
    className: "bg-[#E3F2E7] text-[#1F5A35]",
    icon: (
      <>
        <path d="M3 17 17 3l4 4L7 21z" />
        <path d="m7 13 2 2M10 10l2 2M13 7l2 2" />
      </>
    ),
  },
  from_drawings: {
    text: "From drawings",
    className: "bg-[#E4EEFB] text-[#1D4F8F]",
    icon: (
      <>
        <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
        <path d="M14 3v5h5M8 13h8M8 17h5" />
      </>
    ),
  },
  declared: {
    text: "Declared by seller",
    className: "bg-[#FBEFD9] text-[#6E4300]",
    icon: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
  },
  indicative: {
    text: "Indicative",
    className: "bg-[#ECEEF1] text-[#3B424C]",
    icon: <path d="M4 9c2.5-2 5.5-2 8 0s5.5 2 8 0M4 15c2.5-2 5.5-2 8 0s5.5 2 8 0" />,
  },
  not_found: {
    text: "Not found",
    className: "bg-[#FBE6E3] text-[#962A1D]",
    icon: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5M8.5 8.5l5 5M13.5 8.5l-5 5" />
      </>
    ),
  },
  not_yet_checked: {
    text: "Not yet checked",
    className: "border border-dashed border-[#9EA29A] bg-white text-[#4F554F]",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
};

export function ProvenancePill({ kind }: { kind: Provenance }) {
  const label = LABELS[kind];
  return (
    <span
      className={`inline-flex items-center gap-[5px] rounded-chip py-[3px] pr-2.5 pl-2 font-lb text-xs leading-4 font-semibold whitespace-nowrap ${label.className}`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {label.icon}
      </svg>
      {label.text}
    </span>
  );
}
