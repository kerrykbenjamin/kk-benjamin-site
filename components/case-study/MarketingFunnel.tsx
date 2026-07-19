import Field from "@/components/edit/Field";
import type { FunnelStage } from "@/data/caseStudies";

/**
 * Staged marketing funnel / customer journey. Deliberately reuses the
 * ProcessSteps visual language — numbered circle in the accent ring with
 * connector lines — rather than inventing a second step-flow style. Horizontal
 * at md+, stacked at mobile widths, exactly like ProcessSteps.
 */
export default function MarketingFunnel({
  slug,
  stages,
}: {
  slug: string;
  stages: FunnelStage[];
}) {
  if (stages.length === 0) return null;
  return (
    <ol className="mt-10 flex flex-col gap-10 md:flex-row md:items-start md:gap-0">
      {stages.map((st, i) => {
        const first = i === 0;
        const last = i === stages.length - 1;
        return (
          <li key={i} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center justify-center">
              <span
                aria-hidden
                className={`hidden h-px flex-1 md:block ${
                  first ? "invisible" : "bg-[var(--cs-accent,#6F8B5F)]/30"
                }`}
              />
              <span className="mx-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--cs-accent,#6F8B5F)] font-display text-lg font-semibold text-[var(--cs-text,#1F2A19)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                aria-hidden
                className={`hidden h-px flex-1 md:block ${
                  last ? "invisible" : "bg-[var(--cs-accent,#6F8B5F)]/30"
                }`}
              />
            </div>
            <Field
              id={`case.${slug}.funnel.${i + 1}.title`}
              as="h3"
              className="mt-3 font-display text-lg font-semibold text-[var(--cs-text,#1F2A19)]"
            />
            <ul className="mt-3 grid gap-1.5 text-sm text-[var(--cs-text,#1F2A19)]/70">
              {st.items.map((_, j) => (
                <li key={j}>
                  <Field id={`case.${slug}.funnel.${i + 1}.item.${j + 1}`} as="span" />
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
