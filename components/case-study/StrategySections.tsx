import Field from "@/components/edit/Field";
import type { StrategySection } from "@/data/caseStudies";

/**
 * Numbered rich strategy subsections (The Perfected Flower's five-part
 * strategy) laid out as equal-width cards — 3-up on lg with the remainder row
 * centered, 2-up on md, stacked on mobile. Each carries a title and optionally
 * an intro, bullets, and a closing line. The number badge reuses the
 * ProcessSteps/funnel circle so all step-like numbering on a case study page
 * shares one visual language.
 */
export default function StrategySections({
  slug,
  sections,
}: {
  slug: string;
  sections: StrategySection[];
}) {
  if (sections.length === 0) return null;
  // Equal-width cards: flex-wrap + justify-center gives 3-up rows on lg (2-up
  // on md) with any remainder row centered automatically at the same width —
  // PF's five cards land as 3 + 2-centered. Width calc = one share of the row
  // minus the gaps (gap-5 = 1.25rem). The strategy section sits on a
  // `--cs-card` band (visible-section index 5 for PF — see the alternation
  // note in RichCaseStudy), so cards use `--cs-tint` with a slightly stronger
  // ring than BrandPillars' /5 to stay distinct on the closely-valued band.
  return (
    <ol className="mt-8 flex flex-wrap justify-center gap-5">
      {sections.map((sec, i) => {
        const n = i + 1;
        return (
          <li
            key={i}
            className="w-full rounded-[14px] bg-[var(--cs-surface,#FBF7F1)] p-6 ring-1 ring-inset ring-[var(--cs-text,#1F2A19)]/10 md:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2*1.25rem)/3)]"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--cs-accent,#6F8B5F)] font-display text-sm font-semibold text-[var(--cs-text,#1F2A19)]">
                {String(n).padStart(2, "0")}
              </span>
              <Field
                id={`case.${slug}.strat.${n}.title`}
                as="h3"
                className="font-display text-h3 font-semibold text-[var(--cs-text,#1F2A19)]"
              />
            </div>
            {sec.intro && (
              <Field
                id={`case.${slug}.strat.${n}.intro`}
                as="p"
                className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[var(--cs-text,#1F2A19)]/75"
              />
            )}
            {sec.items && sec.items.length > 0 && (
              <ul className="mt-4 grid gap-2.5">
                {sec.items.map((_, j) => (
                  <li key={j} className="flex gap-3 text-sm leading-relaxed text-[var(--cs-text,#1F2A19)]/80">
                    <span
                      aria-hidden
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--cs-accent,#6F8B5F)]"
                    />
                    <Field id={`case.${slug}.strat.${n}.item.${j + 1}`} as="span" />
                  </li>
                ))}
              </ul>
            )}
            {sec.outro && (
              <Field
                id={`case.${slug}.strat.${n}.outro`}
                as="p"
                className="mt-4 whitespace-pre-line text-sm text-[var(--cs-text,#1F2A19)]/65"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
