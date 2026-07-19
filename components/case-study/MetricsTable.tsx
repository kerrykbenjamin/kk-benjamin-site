import Field from "@/components/edit/Field";
import type { MetricRow } from "@/data/caseStudies";

/**
 * Before/After performance table. Two renderings of the same fields:
 *  - below `sm`: stacked label + Before/After cards (a real table overflows
 *    375px — the site's no-horizontal-scroll rule wins);
 *  - `sm+`: an actual <table>.
 *
 * The projected/sample disclaimer (`note`) is rendered as PLAIN TEXT from the
 * data, on purpose — it is the metrics-honesty label and must not be editable
 * or deletable through edit mode. The "After" column header carries
 * "(projected)" for the same reason.
 */
export default function MetricsTable({
  slug,
  rows,
  note,
}: {
  slug: string;
  rows: MetricRow[];
  note?: string;
}) {
  if (rows.length === 0) return null;
  const cell = (n: number, part: "label" | "before" | "after", cls: string) => (
    <Field id={`case.${slug}.metric.${n}.${part}`} as="span" className={cls} />
  );
  return (
    <div className="max-w-3xl">
      {note && (
        <p className="mt-6 text-sm italic text-[var(--cs-text,#1F2A19)]/60">{note}</p>
      )}

      {/* Mobile: stacked rows */}
      <div className="mt-6 space-y-3 sm:hidden">
        {rows.map((_, i) => {
          const n = i + 1;
          return (
            <div
              key={i}
              className="rounded-[12px] bg-[var(--cs-card,#FFFAF4)] p-4 ring-1 ring-inset ring-[var(--cs-text,#1F2A19)]/5"
            >
              {cell(n, "label", "block text-sm font-medium text-[var(--cs-text,#1F2A19)]")}
              <dl className="mt-2.5 grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-[0.62rem] font-medium uppercase tracking-[0.14em] text-[var(--cs-text,#1F2A19)]/45">
                    Before
                  </dt>
                  <dd className="mt-1 text-[var(--cs-text,#1F2A19)]/75">
                    {cell(n, "before", "")}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.62rem] font-medium uppercase tracking-[0.14em] text-[var(--cs-text,#1F2A19)]/45">
                    After (projected)
                  </dt>
                  <dd className="mt-1 font-semibold text-[var(--cs-text,#1F2A19)]">
                    {cell(n, "after", "")}
                  </dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>

      {/* sm+: real table */}
      <div className="mt-6 hidden overflow-hidden rounded-[14px] ring-1 ring-inset ring-[var(--cs-text,#1F2A19)]/10 sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[var(--cs-card,#FFFAF4)] text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--cs-text,#1F2A19)]/55">
              <th scope="col" className="px-5 py-3.5 font-medium">Metric</th>
              <th scope="col" className="px-5 py-3.5 font-medium">Before</th>
              <th scope="col" className="px-5 py-3.5 font-medium">After (projected)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--cs-text,#1F2A19)]/10">
            {rows.map((_, i) => {
              const n = i + 1;
              return (
                <tr key={i}>
                  <td className="px-5 py-3.5">
                    {cell(n, "label", "font-medium text-[var(--cs-text,#1F2A19)]")}
                  </td>
                  <td className="px-5 py-3.5 text-[var(--cs-text,#1F2A19)]/70">
                    {cell(n, "before", "")}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-[var(--cs-text,#1F2A19)]">
                    {cell(n, "after", "")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
