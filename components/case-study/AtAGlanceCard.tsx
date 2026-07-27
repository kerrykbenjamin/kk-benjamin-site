import Field from "@/components/edit/Field";

const ROWS = [
  { key: "client", label: "Client" },
  { key: "projectType", label: "Project Type" },
  { key: "role", label: "Role" },
  { key: "timeline", label: "Timeline" },
  { key: "tools", label: "Tools Used" },
];

/**
 * Meta block as a labeled-row card (sidebar). Values stay inline-editable.
 *
 * `keys` lists the meta rows this study actually declares — a study whose notes
 * give no timeline (Dunkin) omits that row entirely rather than rendering an
 * empty labeled row. Omit the prop to show all five (existing callers).
 */
export default function AtAGlanceCard({ slug, keys }: { slug: string; keys?: string[] }) {
  const rows = keys ? ROWS.filter((r) => keys.includes(r.key)) : ROWS;
  return (
    <div className="rounded-[14px] border border-[var(--cs-text,#1F2A19)]/10 bg-[var(--cs-card,#FFFAF4)] p-6 sm:p-8">
      <p className="eyebrow text-[var(--cs-text,#1F2A19)]/60">At a glance</p>
      <dl className="mt-5 divide-y divide-[var(--cs-text,#1F2A19)]/10">
        {rows.map((r) => (
          <div key={r.key} className="py-3 first:pt-0 last:pb-0">
            <dt className="eyebrow text-[var(--cs-text,#1F2A19)]/50">{r.label}</dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-[var(--cs-text,#1F2A19)]/85">
              <Field id={`case.${slug}.meta.${r.key}`} as="span" />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
