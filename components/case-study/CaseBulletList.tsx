import Field from "@/components/edit/Field";

/**
 * Generic doc-sourced bullet block: optional heading, intro paragraph, the
 * bullets themselves, optional closing paragraph and pull-quote. Powers the
 * Challenge, Objectives, Local-marketing, projected-outcomes and Key-takeaways
 * sections — one component, five uses, so the bullet idiom (accent dot +
 * editable Field) stays identical everywhere.
 *
 * Boolean props mirror which optional keys were REGISTERED for this study
 * (see registry.ts `block()`): rendering a Field for an unregistered key would
 * fail-visible with the raw key, so callers pass presence flags from the data.
 */
export default function CaseBulletList({
  slug,
  name,
  count,
  hasHeading = false,
  hasIntro = false,
  hasOutro = false,
  hasQuote = false,
  columns = 1,
}: {
  slug: string;
  /** Key prefix under `case.{slug}.` — e.g. "challenge" → challenge.intro, challenge.1… */
  name: string;
  count: number;
  hasHeading?: boolean;
  hasIntro?: boolean;
  hasOutro?: boolean;
  hasQuote?: boolean;
  /** 2 = md two-column grid for long lists (still one column at 375px). */
  columns?: 1 | 2;
}) {
  if (count === 0) return null;
  return (
    <div className="max-w-3xl">
      {hasHeading && (
        <Field
          id={`case.${slug}.${name}.heading`}
          as="h3"
          className="mt-6 font-display text-h3 font-semibold text-[var(--cs-text,#1F2A19)]"
        />
      )}
      {hasIntro && (
        <Field
          id={`case.${slug}.${name}.intro`}
          as="p"
          className="mt-6 whitespace-pre-line text-lead text-[var(--cs-text,#1F2A19)]/75"
        />
      )}
      <ul className={`mt-6 grid gap-3.5 ${columns === 2 ? "md:grid-cols-2" : ""}`}>
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="flex gap-3 text-[var(--cs-text,#1F2A19)]/80">
            <span
              aria-hidden
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--cs-accent,#6F8B5F)]"
            />
            <Field id={`case.${slug}.${name}.${i + 1}`} as="span" />
          </li>
        ))}
      </ul>
      {hasOutro && (
        <Field
          id={`case.${slug}.${name}.outro`}
          as="p"
          className="mt-6 whitespace-pre-line text-[var(--cs-text,#1F2A19)]/75"
        />
      )}
      {hasQuote && (
        <Field
          id={`case.${slug}.${name}.quote`}
          as="blockquote"
          className="mt-5 border-l-2 border-[var(--cs-accent,#6F8B5F)] pl-5 font-display text-h3 leading-snug text-[var(--cs-text,#1F2A19)]"
        />
      )}
    </div>
  );
}
