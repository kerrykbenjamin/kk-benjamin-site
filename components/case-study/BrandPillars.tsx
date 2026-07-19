import Field from "@/components/edit/Field";
import type { Pillar } from "@/data/caseStudies";

/**
 * Brand positioning statement + pillar list. Two shapes, both from the doc:
 *  - described pillars (Natural Beauty: Simplicity/Sustainability/Confidence
 *    with a sentence each) → card grid;
 *  - plain pillars (Throwback: Nostalgia/Community/Family/Fun/Handmade
 *    Quality) → large chip row.
 * The shape is derived from the data (any pillar with a description → cards),
 * not a prop someone must remember to set.
 */
export default function BrandPillars({
  slug,
  positioning,
  hasIntro,
  pillars,
}: {
  slug: string;
  positioning?: string;
  hasIntro: boolean;
  pillars?: Pillar[];
}) {
  const withDesc = (pillars ?? []).some((p) => p.description);
  return (
    <div className="max-w-4xl">
      {positioning && (
        <Field
          id={`case.${slug}.positioning`}
          as="blockquote"
          className="mt-6 max-w-3xl font-display text-h2 font-semibold leading-snug text-[var(--cs-text,#1F2A19)]"
        />
      )}
      {hasIntro && (
        <Field
          id={`case.${slug}.pillars.intro`}
          as="p"
          className="mt-6 text-lead text-[var(--cs-text,#1F2A19)]/75"
        />
      )}
      {pillars && pillars.length > 0 && (
        withDesc ? (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {pillars.map((pl, i) => (
              <div
                key={i}
                className="rounded-[14px] bg-[var(--cs-card,#FFFAF4)] p-6 ring-1 ring-inset ring-[var(--cs-text,#1F2A19)]/5"
              >
                <span
                  aria-hidden
                  className="block h-1 w-8 rounded-full bg-[var(--cs-accent,#6F8B5F)]"
                />
                <Field
                  id={`case.${slug}.pillar.${i + 1}.title`}
                  as="h3"
                  className="mt-4 font-display text-h3 font-semibold text-[var(--cs-text,#1F2A19)]"
                />
                {pl.description && (
                  <Field
                    id={`case.${slug}.pillar.${i + 1}.desc`}
                    as="p"
                    className="mt-2.5 text-sm leading-relaxed text-[var(--cs-text,#1F2A19)]/70"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <ul className="mt-8 flex flex-wrap gap-3">
            {pillars.map((_, i) => (
              <li
                key={i}
                className="rounded-full bg-[var(--cs-dark,#182312)] px-5 py-2.5 font-display text-base font-semibold text-[var(--cs-on-dark,#FBF7F1)]"
              >
                <Field id={`case.${slug}.pillar.${i + 1}.title`} as="span" />
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
