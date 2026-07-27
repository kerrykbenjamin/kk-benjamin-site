import Field from "@/components/edit/Field";
import type { Financials } from "@/data/caseStudies";

/**
 * Proposed financial figures (Dunkin's capstone pricing model).
 *
 * Deliberately a CARD GRID, not a table: a 5-row financial table needs a wide
 * value column and overflows 375px. Cards stack to one column on a phone, so
 * the figures stay readable at every width with no horizontal scroll.
 *
 * The projection disclaimer (`financialsNote`) renders beside the section label
 * in RichCaseStudy and is NOT an editable Field — same rule as MetricsTable's
 * metricsNote and the Results resultsNote. These numbers are projections from an
 * academic model, never achieved results, and that framing must not be
 * removable from the edit UI.
 */
export default function FinancialHighlights({
  slug,
  data,
}: {
  slug: string;
  data: Financials;
}) {
  return (
    <div>
      {data.intro && (
        <Field
          id={`case.${slug}.financials.intro`}
          as="p"
          className="mt-6 max-w-3xl whitespace-pre-line text-lead text-[var(--cs-text,#1F2A19)]/75"
        />
      )}

      <dl className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.figures.map((_, i) => (
          <div
            key={i}
            className="rounded-[14px] bg-[var(--cs-surface,#FFFAF4)] p-6 ring-1 ring-inset ring-[var(--cs-text,#1F2A19)]/5"
          >
            <span
              aria-hidden
              className="block h-1 w-8 rounded-full bg-[var(--cs-accent,#6F8B5F)]"
            />
            <dt className="mt-4">
              <Field
                id={`case.${slug}.fin.${i + 1}.label`}
                as="span"
                className="eyebrow text-[var(--cs-text,#1F2A19)]/55"
              />
            </dt>
            <dd className="mt-2">
              <Field
                id={`case.${slug}.fin.${i + 1}.value`}
                as="span"
                className="font-display text-h2 font-semibold leading-none text-[var(--cs-text,#1F2A19)]"
              />
            </dd>
          </div>
        ))}
      </dl>

      {data.outro && (
        <Field
          id={`case.${slug}.financials.outro`}
          as="p"
          className="mt-8 max-w-3xl whitespace-pre-line text-[var(--cs-text,#1F2A19)]/75"
        />
      )}
    </div>
  );
}
