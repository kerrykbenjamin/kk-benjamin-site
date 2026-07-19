import Field from "@/components/edit/Field";
import type { StrategySection } from "@/data/caseStudies";

/**
 * Numbered rich strategy subsections (The Perfected Flower's five-part
 * strategy). Each carries a title and optionally an intro, bullets, and a
 * closing line. The number badge reuses the ProcessSteps/funnel circle so all
 * step-like numbering on a case study page shares one visual language.
 */
export default function StrategySections({
  slug,
  sections,
}: {
  slug: string;
  sections: StrategySection[];
}) {
  if (sections.length === 0) return null;
  return (
    <ol className="mt-8 max-w-3xl space-y-10">
      {sections.map((sec, i) => {
        const n = i + 1;
        return (
          <li
            key={i}
            className="border-t border-[var(--cs-text,#1F2A19)]/10 pt-8 first:border-t-0 first:pt-0"
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
                className="mt-4 whitespace-pre-line text-[var(--cs-text,#1F2A19)]/75"
              />
            )}
            {sec.items && sec.items.length > 0 && (
              <ul className="mt-4 grid gap-2.5 md:grid-cols-2">
                {sec.items.map((_, j) => (
                  <li key={j} className="flex gap-3 text-[var(--cs-text,#1F2A19)]/80">
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
