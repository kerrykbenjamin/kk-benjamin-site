import Field from "@/components/edit/Field";
import { IconCheck } from "./icons";

/**
 * Deliverables as filled checklist cards. Each item is a `card`-filled row so a
 * short label never leaves an empty grid cell looking like dead space (the old
 * two-column grid did exactly that). Using flex-wrap with `flex-1` + a min basis
 * means the row is always fully packed — a lone final item at an odd count grows
 * to fill its row rather than leaving a hole — so it reflows cleanly at ANY item
 * count: single column on mobile (min basis forces one per row), two per row on
 * desktop. The checkmark uses the validated `dark`/`onDark` pairing for
 * guaranteed contrast across every project's palette. Items stay editable.
 *
 * Two modes, one visual language:
 *  - flat (legacy / Dunkin, PF): `count` items keyed `deliverable.{n}`;
 *  - grouped (doc-sourced NB/TP): `groups` = item count per group, keyed
 *    `delivgroup.{g}.title` + `delivgroup.{g}.item.{m}`, each group under its
 *    own subheading exactly as the doc organizes them.
 */
function Row({ id }: { id: string }) {
  return (
    <li className="flex min-w-[15rem] flex-1 items-center gap-3 rounded-[12px] bg-[var(--cs-surface,#FFFAF4)] px-4 py-3.5 ring-1 ring-inset ring-[var(--cs-text,#1F2A19)]/5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--cs-dark,#182312)] text-[var(--cs-on-dark,#FBF7F1)]">
        <IconCheck className="h-3.5 w-3.5" />
      </span>
      <Field id={id} as="span" className="text-[var(--cs-text,#1F2A19)]/85" />
    </li>
  );
}

export default function DeliverablesChecklist({
  slug,
  count = 0,
  groups,
}: {
  slug: string;
  count?: number;
  /** Item count per group — presence switches to grouped rendering. */
  groups?: number[];
}) {
  if (groups && groups.length > 0) {
    return (
      <div className="space-y-9">
        {groups.map((itemCount, g) => (
          <div key={g}>
            <Field
              id={`case.${slug}.delivgroup.${g + 1}.title`}
              as="h3"
              className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-[var(--cs-text,#1F2A19)]/55"
            />
            <ul className="mt-4 flex flex-wrap gap-3">
              {Array.from({ length: itemCount }, (_, i) => (
                <Row key={i} id={`case.${slug}.delivgroup.${g + 1}.item.${i + 1}`} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }
  if (count === 0) return null;
  return (
    <ul className="flex flex-wrap gap-3">
      {Array.from({ length: count }, (_, i) => (
        <Row key={i} id={`case.${slug}.deliverable.${i + 1}`} />
      ))}
    </ul>
  );
}
