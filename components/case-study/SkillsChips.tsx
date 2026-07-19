import Field from "@/components/edit/Field";

/**
 * Skills-demonstrated tag cloud. Chips use the dark/onDark pairing — the
 * contrast-verified combination on every project palette — so the row stays
 * legible whichever section background the alternation assigns it.
 * flex-wrap reflows cleanly at any count (same idiom as DeliverablesChecklist).
 */
export default function SkillsChips({ slug, count }: { slug: string; count: number }) {
  if (count === 0) return null;
  return (
    <ul className="mt-8 flex max-w-3xl flex-wrap gap-2.5">
      {Array.from({ length: count }, (_, i) => (
        <li
          key={i}
          className="rounded-full bg-[var(--cs-dark,#182312)] px-4 py-2 text-sm text-[var(--cs-on-dark,#FBF7F1)]"
        >
          <Field id={`case.${slug}.skill.${i + 1}`} as="span" />
        </li>
      ))}
    </ul>
  );
}
