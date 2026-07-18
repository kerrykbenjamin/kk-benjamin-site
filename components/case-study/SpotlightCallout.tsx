import ImageSlot from "@/components/edit/ImageSlot";

/**
 * Campaign spotlight — a dark card holding three campaign photos (replaces the
 * old mocked ad + "SHOP NOW" button). Keeps the theme's `dark`/`onDark` pairing
 * (validated 5:1–9:1 contrast per project — CASE_STUDY_PALETTES.md).
 *
 * The three photos start as intentional placeholders (ImageSlot mode="show",
 * tone="dark") and are filled in by the client through the same edit-mode photo
 * flow. Three across on desktop, single column on mobile.
 */
export default function SpotlightCallout({ slug }: { slug: string }) {
  return (
    <div className="overflow-hidden rounded-[18px] bg-[var(--cs-dark,#182312)] px-6 py-12 text-[var(--cs-on-dark,#FBF7F1)] sm:px-10 sm:py-16">
      <p className="eyebrow text-center text-[var(--cs-on-dark,#FBF7F1)]/70">
        Campaign spotlight
      </p>
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
