import type { Metadata } from "next";
import Container from "@/components/Container";
import ButtonLink from "@/components/ButtonLink";
import Reveal from "@/components/Reveal";
import PortfolioGallery from "@/components/PortfolioGallery";
import CaseStudyCard from "@/components/CaseStudyCard";
import GalleryPlaceholder from "@/components/GalleryPlaceholder";
import Field from "@/components/edit/Field";
import EditModeOnly from "@/components/edit/EditModeOnly";
import ImageSlot from "@/components/edit/ImageSlot";
import OrderedGrid, { type OrderedItem } from "@/components/edit/OrderedGrid";
import { caseStudies } from "@/data/caseStudies";
import {
  portfolioIllustrations,
  SHOW_ILLUSTRATIONS_GALLERY,
} from "@/data/portfolioIllustrations";
import { getText } from "@/lib/content";
import { getIsEditor } from "@/lib/editor-state";
import { getOrder, applyOrder } from "@/lib/order";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "A curated look at brand systems, social campaigns, digital strategy, and content concepts.",
};

export default async function PortfolioPage() {
  const [caseOrder, illusOrder, editor] = await Promise.all([
    getOrder("caseStudies", caseStudies.map((c) => c.slug)),
    // Skipped while the gallery is flagged off — no order lookup for a
    // collection that isn't on the page.
    SHOW_ILLUSTRATIONS_GALLERY
      ? getOrder("portfolioIllustrations", portfolioIllustrations.map((i) => i.id))
      : Promise.resolve<string[]>([]),
    getIsEditor(),
  ]);

  const orderedStudies = applyOrder(caseStudies, caseOrder, (c) => c.slug);
  const caseItems: OrderedItem[] = orderedStudies.map((s, i) => ({
    id: s.slug,
    node: <CaseStudyCard key={s.slug} slug={s.slug} priority={i === 0} />,
  }));

  // Gallery tiles: uniform 1:1 squares, BARE photos for visitors — the
  // title/tagline no longer render on the tile; they appear bottom-left inside
  // the lightbox instead (passed via lightboxCaption). The caption data stays
  // editable: an EDITOR still sees the ✎ fields under each tile. Empty slots
  // show the styled GalleryPlaceholder and aren't lightbox-eligible until a
  // real photo is uploaded.
  //
  // While SHOW_ILLUSTRATIONS_GALLERY is off this resolves to an empty list, so
  // none of the below runs: no getText() for the captions, no ImageSlot (hence
  // no edit affordances and no `portfolio-gallery` lightbox group), no fetches
  // for the hidden fields. All the code stays put for when the flag flips back.
  const orderedIllus = SHOW_ILLUSTRATIONS_GALLERY
    ? applyOrder(portfolioIllustrations, illusOrder, (i) => i.id)
    : [];
  const illusItems: OrderedItem[] = await Promise.all(
    orderedIllus.map(async (illus, i) => {
      const [title, tagline] = await Promise.all([
        getText(`portfolio.illus.${illus.n}.title`),
        getText(`portfolio.illus.${illus.n}.tagline`),
      ]);
      return {
        id: illus.id,
        node: (
          // Stagger caps at 6 tiles: uncapped, tile 16 would sit invisible for
          // 1.2s after scrolling into view.
          <Reveal key={illus.id} delay={Math.min(i, 5) * 0.08}>
            <div className="group">
              <ImageSlot
                id={`portfolio.illus.${illus.n}.image`}
                alt={title || `Gallery photo ${illus.n}`}
                mode="show"
                sizes="(max-width: 1024px) 50vw, 25vw"
                placeholder={<GalleryPlaceholder />}
                lightbox="portfolio-gallery"
                lightboxCaption={{ title, desc: tagline }}
                // object-CONTAIN: the whole photo is always visible, whatever
                // its aspect ratio — portrait and landscape shots letterbox
                // inside the square instead of being center-cropped. The tile
                // footprint stays identical for every item, so the grid is
                // still perfectly even.
                imgClassName="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                // `cream` is the letterbox fill: one step warmer/darker than
                // this section's `ivory`, so the unused space around a
                // non-square photo reads as a deliberate card, not a gap.
                wrapperClassName="relative aspect-square w-full overflow-hidden rounded-[14px] bg-cream"
              />
              {/* Caption fields exist ONLY while "Edit site" is toggled on —
                  a logged-in editor who is just browsing sees the same bare
                  grid as visitors. The text itself displays in the lightbox. */}
              {editor && (
                <EditModeOnly>
                  <Field
                    id={`portfolio.illus.${illus.n}.title`}
                    as="h3"
                    className="mt-4 font-display text-h3 font-semibold text-forest"
                  />
                  <Field
                    id={`portfolio.illus.${illus.n}.tagline`}
                    as="p"
                    className="mt-1 text-sm text-forest/60"
                  />
                </EditModeOnly>
              )}
            </div>
          </Reveal>
        ),
      };
    }),
  );

  return (
    <>
      {/* Intro */}
      <section className="bg-cream">
        <Container className="max-w-3xl py-14 sm:py-20 lg:py-24">
          <Field id="portfolio.intro.eyebrow" as="p" className="eyebrow text-sage" />
          <Field
            id="portfolio.intro.h1"
            as="h1"
            className="mt-5 font-display text-display font-semibold text-forest"
          />
          <Field
            id="portfolio.intro.sub"
            as="p"
            className="mt-6 whitespace-pre-line text-lead text-forest/70"
          />
        </Container>
      </section>

      {/* Case studies + filters */}
      <section className="bg-cream">
        <Container className="pb-6">
          <PortfolioGallery>
            <OrderedGrid
              collection="caseStudies"
              items={caseItems}
              className="mt-10 grid gap-x-7 gap-y-12 sm:grid-cols-2"
            />
          </PortfolioGallery>
        </Container>
      </section>

      {/* Illustrations and projects — gated by SHOW_ILLUSTRATIONS_GALLERY in
          data/portfolioIllustrations.ts. Flip that one constant to `true` to
          restore this section exactly as it was; nothing here was deleted. */}
      {SHOW_ILLUSTRATIONS_GALLERY && (
        <section className="bg-ivory">
          <Container className="py-16 sm:py-24">
            <div className="max-w-2xl">
              <Field id="portfolio.illustrations.eyebrow" as="p" className="eyebrow text-sage" />
              <Field
                id="portfolio.illustrations.h2"
                as="h2"
                className="mt-4 font-display text-h2 font-semibold text-forest"
              />
            </div>
            {/* Uniform square-tile gallery, GALLERY_SLOT_COUNT tiles: 2 columns
                up to lg, 4 at lg+. A 3-col md step is deliberately skipped —
                16 divides evenly into 2 and 4 (8 full rows / a clean 4×4) but
                not into 3, which would strand a single orphan tile on the last
                row between 768px and 1024px. */}
            <OrderedGrid
              collection="portfolioIllustrations"
              items={illusItems}
              className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
            />
          </Container>
        </section>
      )}

      {/* Mini CTA. Normally the `cream` half of the alternation that follows the
          `ivory` gallery band — but with the gallery flagged off it inherits
          `ivory` itself, so the CTA still reads as its own section instead of
          merging into the cream case-studies block above it. The vertical
          rhythm is identical either way: the colour boundary still lands 24px
          (Container pb-6) below the last case-study card. */}
      <section className={SHOW_ILLUSTRATIONS_GALLERY ? "bg-cream" : "bg-ivory"}>
        <Container className="py-16 text-center sm:py-20">
          <Field
            id="portfolio.cta.h2"
            as="h2"
            className="mx-auto max-w-2xl font-display text-h2 font-semibold text-forest"
          />
          {/* In-page anchor to the global <ContactCTA id="contact"> rendered
              after <main> — visitors stay on the page instead of being handed
              off to a mail client. Smooth scroll (and its reduced-motion
              opt-out) comes from html{scroll-behavior} in globals.css; the
              64px sticky-header offset from the target's own scroll-mt-16. */}
          <div className="mt-8 flex justify-center">
            <ButtonLink href="#contact" variant="solid" arrow>
              Let&apos;s talk
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
