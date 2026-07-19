import Field from "@/components/edit/Field";
import ImageSlot from "@/components/edit/ImageSlot";
import type { CampaignInfo } from "@/data/caseStudies";

/**
 * Campaign spotlight — a dark card holding three campaign photos (replaces the
 * old mocked ad + "SHOP NOW" button). Keeps the theme's `dark`/`onDark` pairing
 * (validated 5:1–9:1 contrast per project — CASE_STUDY_PALETTES.md).
 *
 * When the study carries doc-sourced campaign copy (`info` — e.g. NB's "Glow
 * Naturally", Throwback's "Flashback Fridays"), the card leads with the
 * campaign name, description and element list (keys under `featured.*`), then
 * the photos. Without it, the card is photos-only, exactly as before (Dunkin,
 * Perfected Flower).
 *
 * The three photos start as intentional placeholders (ImageSlot mode="show",
 * tone="dark") and are filled in by the client through the same edit-mode photo
 * flow. Three across on desktop, single column on mobile.
 */
export default function SpotlightCallout({
  slug,
  info,
}: {
  slug: string;
  info?: CampaignInfo;
}) {
  return (
    <div className="overflow-hidden rounded-[18px] bg-[var(--cs-dark,#182312)] px-6 py-12 text-[var(--cs-on-dark,#FBF7F1)] sm:px-10 sm:py-16">
      <p className="eyebrow text-center text-[var(--cs-on-dark,#FBF7F1)]/70">
        {info?.label ?? "Campaign spotlight"}
      </p>

      {info && (
        <div className="mx-auto mt-6 max-w-2xl text-center">
          <Field
            id={`case.${slug}.featured.title`}
            as="h3"
            className="font-display text-h2 font-semibold"
          />
          {info.description && (
            <Field
              id={`case.${slug}.featured.desc`}
              as="p"
              className="mt-4 whitespace-pre-line text-[var(--cs-on-dark,#FBF7F1)]/80"
            />
          )}
          {info.items && info.items.length > 0 && (
            <ul className="mx-auto mt-5 inline-grid gap-2 text-left sm:grid-cols-2 sm:gap-x-10">
              {info.items.map((_, i) => (
                <li key={i} className="flex gap-3 text-[var(--cs-on-dark,#FBF7F1)]/85">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--cs-on-dark,#FBF7F1)]/50"
                  />
                  <Field id={`case.${slug}.featured.item.${i + 1}`} as="span" />
                </li>
              ))}
            </ul>
          )}
          {info.outro && (
            <Field
              id={`case.${slug}.featured.outro`}
              as="p"
              className="mt-5 whitespace-pre-line text-sm text-[var(--cs-on-dark,#FBF7F1)]/65"
            />
          )}
        </div>
      )}

      <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {[1, 2, 3].map((n) => (
          <ImageSlot
            key={n}
            id={`case.${slug}.spotlight.${n}.image`}
            alt={`Campaign photo ${n}`}
            mode="show"
            tone="dark"
            lightbox={`case:${slug}`}
            label={`Campaign photo ${n}`}
            sizes="(max-width: 640px) 88vw, 30vw"
            wrapperClassName="relative aspect-[4/5] w-full overflow-hidden rounded-[12px]"
          />
        ))}
      </div>
    </div>
  );
}
