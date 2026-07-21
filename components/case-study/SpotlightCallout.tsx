import Field from "@/components/edit/Field";
import SpotlightCarousel, { type SpotlightSlide } from "@/components/media/SpotlightCarousel";
import SpotlightCarouselEditor from "@/components/media/SpotlightCarouselEditor";
import { getImage } from "@/lib/content";
import { getIsEditor } from "@/lib/editor-state";
import { posterKeyFor, SPOTLIGHT_SLOT_COUNT } from "@/lib/media";
import type { CampaignInfo } from "@/data/caseStudies";

/**
 * Campaign spotlight — a dark card holding the featured campaign media
 * (replaces the old mocked ad + "SHOP NOW" button). Keeps the theme's
 * `dark`/`onDark` pairing (validated 5:1–9:1 contrast per project —
 * CASE_STUDY_PALETTES.md).
 *
 * When the study carries doc-sourced campaign copy (`info` — e.g. NB's "Glow
 * Naturally", Throwback's "Flashback Fridays"), the card leads with the
 * campaign name, description and element list (keys under `featured.*`), then
 * the media. Without it, the card is media-only, exactly as before (Dunkin,
 * Perfected Flower).
 *
 * The media area is a ONE-at-a-time carousel over SPOTLIGHT_SLOT_COUNT slots
 * (keys `case.<slug>.spotlight.<n>.image` + companion `.poster`). Each slot
 * independently holds a photo, a GIF, or a short video clip (caps/formats in
 * lib/media.ts; video plays in place and skips the lightbox). Slot values are
 * gathered HERE, server-side, so the client carousel receives plain data —
 * empty slots are skipped for visitors, and all slots become editable slides
 * in edit mode (see SpotlightCarousel for the full rules).
 */
export default async function SpotlightCallout({
  slug,
  info,
}: {
  slug: string;
  info?: CampaignInfo;
}) {
  const [editor, slides] = await Promise.all([
    getIsEditor(),
    Promise.all(
      Array.from({ length: SPOTLIGHT_SLOT_COUNT }, (_, i) => i + 1).map(
        async (n): Promise<SpotlightSlide> => {
          const key = `case.${slug}.spotlight.${n}.image`;
          const [src, poster] = await Promise.all([
            getImage(key),
            getImage(posterKeyFor(key)),
          ]);
          return { n, key, src, poster };
        },
      ),
    ),
  ]);

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

      <div className="mx-auto mt-8 w-full max-w-3xl">
        {editor ? (
          <SpotlightCarouselEditor slug={slug} slides={slides} />
        ) : (
          <SpotlightCarousel slug={slug} slides={slides} editMode={false} />
        )}
      </div>
    </div>
  );
}
