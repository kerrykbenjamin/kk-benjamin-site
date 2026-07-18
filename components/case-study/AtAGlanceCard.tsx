import Field from "@/components/edit/Field";

const ROWS = [
  { key: "client", label: "Client" },
  { key: "projectType", label: "Project Type" },
  { key: "role", label: "Role" },
  { key: "timeline", label: "Timeline" },
  { key: "tools", label: "Tools Used" },
];

/** Meta block as a labeled-row card (sidebar). Values stay inline-editable. */
export default function AtAGlanceCard({ slug }: { slug: string }) {
  return (
    <div className="rounded-[14px] border border-[var(--cs-text,#1F2A19)]/10 bg-[var(--cs-card,#FFFAF4)] p-6 sm:p-8">
      <p className="eyebrow text-[var(--cs-text,#1F2A19)]/60">At a glance</p>
      <dl className="mt-5 divide-y divide-[var(--cs-text,#1F2A19)]/10">
        {ROWS.map((r) => (
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
