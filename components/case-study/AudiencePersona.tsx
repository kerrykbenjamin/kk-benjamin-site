import Field from "@/components/edit/Field";
import type { Audience, Persona } from "@/data/caseStudies";

/**
 * Target audience list + customer persona callout, side by side on desktop.
 * The persona deliberately uses the dark/onDark pairing — the one combination
 * contrast-verified across every project palette (CASE_STUDY_PALETTES.md) —
 * so it reads as a distinct "card" against either section background and never
 * fails contrast on a themed page.
 */
export default function AudiencePersona({
  slug,
  audience,
  persona,
}: {
  slug: string;
  audience?: Audience;
  persona?: Persona;
}) {
  if (!audience && !persona) return null;
  return (
    <div
      className={`mt-8 grid gap-8 ${audience && persona ? "lg:grid-cols-2 lg:gap-12" : ""}`}
    >
      {audience && (
        <div>
          <p className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[var(--cs-text,#1F2A19)]/45">
            Primary audience
          </p>
          {audience.primaryIntro && (
            <Field
              id={`case.${slug}.audience.intro`}
              as="p"
              className="mt-4 text-lead text-[var(--cs-text,#1F2A19)]/75"
            />
          )}
          <ul className="mt-5 grid gap-3">
            {audience.primary.map((_, i) => (
              <li key={i} className="flex gap-3 text-[var(--cs-text,#1F2A19)]/80">
                <span
                  aria-hidden
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--cs-accent,#6F8B5F)]"
                />
                <Field id={`case.${slug}.audience.${i + 1}`} as="span" />
              </li>
            ))}
          </ul>
          {audience.secondary && (
            <div className="mt-7">
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[var(--cs-text,#1F2A19)]/45">
                Secondary audience
              </p>
              <Field
                id={`case.${slug}.audience.secondary`}
                as="p"
                className="mt-3 text-[var(--cs-text,#1F2A19)]/80"
              />
            </div>
          )}
        </div>
      )}

      {persona && (
        <div className="self-start rounded-[16px] bg-[var(--cs-dark,#182312)] p-7 text-[var(--cs-on-dark,#FBF7F1)] sm:p-9">
          <p className="eyebrow text-[var(--cs-on-dark,#FBF7F1)]/60">Customer persona</p>
          <Field
            id={`case.${slug}.persona.name`}
            as="h3"
            className="mt-4 font-display text-h2 font-semibold"
          />
          <Field
            id={`case.${slug}.persona.body`}
            as="p"
            className="mt-4 whitespace-pre-line leading-relaxed text-[var(--cs-on-dark,#FBF7F1)]/85"
          />
        </div>
      )}
    </div>
  );
}
