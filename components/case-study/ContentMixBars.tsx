import Field from "@/components/edit/Field";
import type { MixCategory } from "@/data/caseStudies";

/**
 * Weighted content-mix breakdown as CSS-only proportional bars — no charting
 * library, no client JS. The percentage comes from the DATA (not an editable
 * field) because it drives the bar width; the label and sub-items stay
 * editable. Bar fill uses the accent role, which is explicitly allowed for
 * decorative shapes (CASE_STUDY_PALETTES.md) — the readable percent number
 * itself uses the contrast-safe text role.
 */
export default function ContentMixBars({
  slug,
  mix,
  hasIntro,
}: {
  slug: string;
  mix: MixCategory[];
  hasIntro: boolean;
}) {
  if (mix.length === 0) return null;
  return (
    <div className="max-w-3xl">
      {hasIntro && (
        <Field
          id={`case.${slug}.mix.intro`}
          as="p"
          className="mt-6 text-lead text-[var(--cs-text,#1F2A19)]/75"
        />
      )}
      <div className="mt-8 space-y-7">
        {mix.map((m, i) => (
          <div key={i}>
            <div className="flex items-baseline gap-3">
              <span className="font-display text-h3 font-semibold tabular-nums text-[var(--cs-text,#1F2A19)]">
                {m.percent}%
              </span>
              <Field
                id={`case.${slug}.mix.${i + 1}.label`}
                as="span"
                className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--cs-text,#1F2A19)]/70"
              />
            </div>
            <div
              className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--cs-text,#1F2A19)]/10"
              role="img"
              aria-label={`${m.percent} percent`}
            >
              <div
                className="h-full rounded-full bg-[var(--cs-accent,#6F8B5F)]"
                style={{ width: `${m.percent}%` }}
              />
            </div>
            <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[var(--cs-text,#1F2A19)]/65">
              {m.items.map((_, j) => (
                <li key={j} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-1 w-1 shrink-0 rounded-full bg-[var(--cs-text,#1F2A19)]/40"
                  />
                  <Field id={`case.${slug}.mix.${i + 1}.item.${j + 1}`} as="span" />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
