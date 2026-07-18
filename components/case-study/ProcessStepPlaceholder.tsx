import type { ReactNode } from "react";

/**
 * The designed "no photo yet" tile for a process-step image slot. Publicly
 * visible until the client uploads a real photo, so it must read as a
 * deliberate design element — icon + step name on the project's own `tint`
 * fill — never a broken image, gray box, or dashed "empty" frame.
 *
 * Colors come only from the scoped theme vars RichCaseStudy sets: `tint` for
 * the fill (contrasts with the Process section's `card` background) and the
 * contrast-safe `text` role for the icon strokes + label (decorative-only
 * accents are banned here per CASE_STUDY_PALETTES.md). A project with no
 * theme (Dunkin) falls back to default DESIGN_TOKENS.md values via the
 * var() fallbacks. Pure presentational — safe in server and client trees.
 */
export default function ProcessStepPlaceholder({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-[inherit] bg-[var(--cs-tint,#FBF7F1)] px-3 text-center ring-1 ring-inset ring-[var(--cs-text,#1F2A19)]/10">
      <span aria-hidden className="text-[var(--cs-text,#1F2A19)]/55 [&>svg]:h-7 [&>svg]:w-7">
        {icon}
      </span>
      <span className="text-[0.62rem] font-medium uppercase tracking-[0.14em] text-[var(--cs-text,#1F2A19)]/60">
        {label}
      </span>
    </div>
  );
}
