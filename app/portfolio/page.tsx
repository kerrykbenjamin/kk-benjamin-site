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
import { portfolioIllustrations } from "@/data/portfolioIllustrations";
import { getText } from "@/lib/content";
import { getIsEditor } from "@/lib/editor-state";
import { getOrder, applyOrder } from "@/lib/order";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "A curated look at brand systems, social campaigns, digital strategy, and content concepts.",
};

export default async function PortfolioPage() {
  const [email, caseOrder, illusOrder, editor] = await Promise.all([
    getText("global.contact.email"),
    getOrder("caseStudies", caseStudies.map((c) => c.slug)),
    getOrder("portfolioIllustrations", portfolioIllustrations.map((i) => i.id)),
    getIsEditor(),
  ]);
  const mailto = `mailto:${email}`;

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
  const orderedIllus = applyOrder(portfolioIllustrations, illusOrder, (i) => i.id);
  const illusItems: OrderedItem[] = await Promise.all(
    orderedIllus.map(async (illus, i) => {
      const [title, tagline] = await Promise.all([
        getText(`portfolio.illus.${illus.n}.title`),
        getText(`portfolio.illus.${illus.n}.tagline`),
      ]);
      return {
        id: illus.id,
        node: (
          <Reveal key={illus.id} delay={i * 0.08}>
            <div className="group">
              <ImageSlot
                id={`portfolio.illus.${illus.n}.image`}
                alt={title || `Gallery photo ${illus.n}`}
                mode="show"
                sizes="(max-width: 1024px) 50vw, 25vw"
                placeholder={<GalleryPlaceholder />}
                lightbox="portfolio-gallery"
                lightboxCaption={{ title, desc: tagline }}
                imgClassName="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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

      {/* Illustrations and projects */}
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
          {/* Uniform square-tile gallery: 2×2 up to lg, one row of 4 at lg+.
              3-col md is deliberately skipped — 4 tiles in 3 columns leaves an
              orphaned partial row. */}
          <OrderedGrid
            collection="portfolioIllustrations"
            items={illusItems}
            className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
          />
        </Container>
      </section>

      {/* Mini CTA */}
      <section className="bg-cream">
        <Container className="py-16 text-center sm:py-20">
          <Field
            id="portfolio.cta.h2"
            as="h2"
            className="mx-auto max-w-2xl font-display text-h2 font-semibold text-forest"
          />
          <div className="mt-8 flex justify-center">
            <ButtonLink href={mailto} variant="solid" arrow>
              Let&apos;s talk
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
