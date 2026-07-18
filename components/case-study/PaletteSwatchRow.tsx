import type { PaletteColor } from "@/data/caseStudies";

/**
 * Displays the CLIENT project's own brand colors as content. The swatch fill is
 * the only place a raw hex appears (it IS the content — sampled/verified in
 * CASE_STUDY_PALETTES.md); the container + labels use the theme's text color.
 * Static (not part of the inline text editor).
 */
export default function PaletteSwatchRow({ palette }: { palette?: PaletteColor[] }) {
  if (!palette || palette.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-5 sm:gap-x-8">
      {palette.map((c) => (
        <li key={c.hex} className="flex flex-col items-center gap-2 text-center">
          <span
            className="h-14 w-14 rounded-full ring-1 ring-inset ring-[var(--cs-text,#1F2A19)]/10"
            style={{ backgroundColor: c.hex }}
            aria-hidden
          />
          <span className="text-xs font-medium text-[var(--cs-text,#1F2A19)]/70">
            {c.name}
          </span>
          <span className="text-[0.65rem] uppercase tracking-wide text-[var(--cs-text,#1F2A19)]/40">
            {c.hex}
          </span>
        </li>
      ))}
    </ul>
  );
}
