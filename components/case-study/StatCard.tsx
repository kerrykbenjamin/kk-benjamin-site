import type { ReactNode } from "react";
import Field from "@/components/edit/Field";

/**
 * One result stat as an icon-led card. The icon sits on a solid `dark`-filled
 * badge with an `onDark` glyph — this pairing is the one validated at 5:1–9:1
 * contrast for every project (see CASE_STUDY_PALETTES.md), so the icon stays
 * legible regardless of which project's palette is active. Value + label stay
 * inline-editable.
 */
export default function StatCard({
  slug,
  index,
  icon,
}: {
  slug: string;
  index: number;
  icon: ReactNode;
}) {
  const n = index + 1;
  return (
    <div className="rounded-[14px] bg-[var(--cs-surface,#FFFAF4)] p-6 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--cs-dark,#182312)] text-[var(--cs-on-dark,#FBF7F1)]">
        {icon}
      </span>
      <Field
        id={`case.${slug}.result.${n}.value`}
        as="div"
        className="mt-3 font-display text-stat font-semibold text-[var(--cs-text,#1F2A19)]"
      />
      <Field
        id={`case.${slug}.result.${n}.label`}
        as="div"
        className="mt-1.5 text-sm text-[var(--cs-text,#1F2A19)]/60"
      />
    </div>
  );
}
